import { randomUUID } from 'node:crypto'
import * as fs from 'node:fs/promises'
import { join } from 'node:path'

export type SetupReportFileSystem = Pick<typeof fs, 'mkdir' | 'readFile' | 'writeFile' | 'stat' | 'rename' | 'rm' | 'rmdir'>

type SetupReportClaim = { _tag: 'Allowed' } | { _tag: 'Skipped', reason: 'cooldown' | 'busy' | 'filesystem' }

const interval = 7 * 24 * 60 * 60 * 1000
const lockLifetime = 5 * 60 * 1000

function errorCode(error: unknown): unknown {
  return error !== null && typeof error === 'object' && 'code' in error ? error.code : undefined
}

function lastShownAt(value: string): number | undefined {
  // Corrupt cache records are replaceable. They never invalidate the app configuration.
  try {
    const record = JSON.parse(value)
    if (record?.version === 1 && Number.isSafeInteger(record.lastShownAt) && record.lastShownAt >= 0)
      return record.lastShownAt
  }
  catch {
    return undefined
  }
}

/** Reserve a report that is ready to print. Each report has its own cooldown. */
export async function claimSetupReport(options: {
  report: 'setup-tips' | 'production-site-url'
  stateDirectory: string
  now?: () => number
  fileSystem?: SetupReportFileSystem
}): Promise<SetupReportClaim> {
  const fileSystem = options.fileSystem || fs
  const now = (options.now || Date.now)()
  const lock = join(options.stateDirectory, `${options.report}.lock`)
  const state = join(options.stateDirectory, `${options.report}.json`)
  const token = randomUUID()
  const receipt = join(lock, `${token}.json`)
  let ownsLock = false

  const run = async (): Promise<SetupReportClaim> => {
    await fileSystem.mkdir(options.stateDirectory, { recursive: true })
    const acquire = () => fileSystem.mkdir(lock).then(() => true).catch((error: unknown) => {
      if (errorCode(error) === 'EEXIST')
        return false
      throw error
    })
    if (!await acquire()) {
      const previous = await fileSystem.stat(lock)
      if (now - previous.mtimeMs < lockLifetime)
        return { _tag: 'Skipped', reason: 'busy' }
      // Move the abandoned lease before cleanup, so cleanup cannot delete a new owner's lock.
      const abandoned = `${lock}.${token}`
      await fileSystem.rename(lock, abandoned)
      const moved = await fileSystem.stat(abandoned)
      await fileSystem.rm(abandoned, { recursive: true, force: true })
      if (moved.mtimeMs !== previous.mtimeMs || !await acquire())
        return { _tag: 'Skipped', reason: 'busy' }
    }
    ownsLock = true

    // Stage inside the lease. If recovery moves the lease, its receipt cannot commit from this path.
    await fileSystem.writeFile(receipt, JSON.stringify({ version: 1, lastShownAt: now }), { flag: 'wx', mode: 0o600 })
    const saved = await fileSystem.readFile(state, 'utf8').catch((error: unknown) => {
      if (errorCode(error) === 'ENOENT')
        return undefined
      throw error
    })
    const timestamp = saved === undefined ? undefined : lastShownAt(saved)
    if (timestamp !== undefined && now - timestamp < interval)
      return { _tag: 'Skipped', reason: 'cooldown' }
    await fileSystem.rename(receipt, state)
    return { _tag: 'Allowed' }
  }

  const result = await run().catch((): SetupReportClaim => ({ _tag: 'Skipped', reason: 'filesystem' }))
  // Skip cooldown-limited output if the cache cannot record it. Keep the page request independent.
  if (ownsLock) {
    await fileSystem.rm(receipt, { force: true }).catch(() => {
      // Cleanup is best effort. Expiring leases recover abandoned artifacts on a later request.
    })
    await fileSystem.rmdir(lock).catch(() => {
      // Another owner may hold a recovered lease. Preserve its nonempty directory.
    })
  }
  return result
}

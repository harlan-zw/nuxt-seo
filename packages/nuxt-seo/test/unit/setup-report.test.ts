import type { SetupTipsFileSystem } from '../../src/runtime/server/utils/setup-report'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'
import { claimSetupTips } from '../../src/runtime/server/utils/setup-report'

const week = 7 * 24 * 60 * 60 * 1000
const now = 1_790_000_000_000
const directories: string[] = []

afterEach(async () => {
  await Promise.all(directories.splice(0).map(directory => fs.rm(directory, { recursive: true, force: true })))
})

async function fixture() {
  const directory = await fs.mkdtemp(join(tmpdir(), 'nuxt-seo-setup-tips-'))
  directories.push(directory)
  return join(directory, '.nuxt', 'cache', 'nuxt-seo')
}

async function writeRecord(stateDirectory: string, timestamp: number) {
  await fs.mkdir(stateDirectory, { recursive: true })
  await fs.writeFile(join(stateDirectory, 'setup-tips.json'), JSON.stringify({ version: 1, lastShownAt: timestamp }))
}

it('claims missing state once and suppresses another display within seven days', async () => {
  const stateDirectory = await fixture()
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
  expect(await claimSetupTips({ stateDirectory, now: () => now + week - 1 })).toEqual({ _tag: 'Skipped', reason: 'cooldown' })
})

it('permits a display once the full seven-day interval expires', async () => {
  const stateDirectory = await fixture()
  await writeRecord(stateDirectory, now - week)
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
})

it('skips future timestamps instead of repeatedly reporting after a clock change', async () => {
  const stateDirectory = await fixture()
  await writeRecord(stateDirectory, now + week)
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Skipped', reason: 'cooldown' })
})

it('replaces corrupted state once without a repeated report', async () => {
  const stateDirectory = await fixture()
  await fs.mkdir(stateDirectory, { recursive: true })
  await fs.writeFile(join(stateDirectory, 'setup-tips.json'), '{invalid')
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Skipped', reason: 'cooldown' })
})

it('skips filesystem failures without throwing or writing a report receipt', async () => {
  const stateDirectory = await fixture()
  const fileSystem: SetupTipsFileSystem = { ...fs, mkdir: vi.fn().mockRejectedValue(Object.assign(new Error('Permission denied'), { code: 'EACCES' })) }
  expect(await claimSetupTips({ stateDirectory, now: () => now, fileSystem })).toEqual({ _tag: 'Skipped', reason: 'filesystem' })
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
})

it('allows only one concurrent server to display tips', async () => {
  const stateDirectory = await fixture()
  const results = await Promise.all(Array.from({ length: 12 }, () => claimSetupTips({ stateDirectory, now: () => now })))
  expect(results.filter(result => result._tag === 'Allowed')).toHaveLength(1)
})

it('allows only one concurrent server when an earlier receipt expires', async () => {
  const stateDirectory = await fixture()
  await writeRecord(stateDirectory, now - week)
  const results = await Promise.all(Array.from({ length: 12 }, () => claimSetupTips({ stateDirectory, now: () => now })))
  expect(results.filter(result => result._tag === 'Allowed')).toHaveLength(1)
})

it('retries after a receipt cannot commit without starting the cooldown', async () => {
  const stateDirectory = await fixture()
  const fileSystem: SetupTipsFileSystem = { ...fs, rename: vi.fn().mockRejectedValue(Object.assign(new Error('Permission denied'), { code: 'EACCES' })) }
  expect(await claimSetupTips({ stateDirectory, now: () => now, fileSystem })).toEqual({ _tag: 'Skipped', reason: 'filesystem' })
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
})

it('recovers an abandoned lock while respecting fresh locks', async () => {
  const stateDirectory = await fixture()
  const lock = join(stateDirectory, 'setup-tips.lock')
  await fs.mkdir(lock, { recursive: true })
  await fs.utimes(lock, new Date(now), new Date(now))
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Skipped', reason: 'busy' })
  await fs.utimes(lock, new Date(now - week), new Date(now - week))
  expect(await claimSetupTips({ stateDirectory, now: () => now })).toEqual({ _tag: 'Allowed' })
})

it('does not duplicate a report when servers recover an abandoned lease together', async () => {
  const stateDirectory = await fixture()
  const lock = join(stateDirectory, 'setup-tips.lock')
  await fs.mkdir(lock, { recursive: true })
  await fs.utimes(lock, new Date(now - week), new Date(now - week))
  const results = await Promise.all(Array.from({ length: 12 }, () => claimSetupTips({ stateDirectory, now: () => now })))
  expect(results.filter(result => result._tag === 'Allowed')).toHaveLength(1)
})

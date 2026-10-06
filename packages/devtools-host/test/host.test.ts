import type { Nuxt } from 'nuxt/schema'
import { EventEmitter } from 'node:events'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PassThrough } from 'node:stream'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setupDevToolsRpc, setupDevToolsUI, UNIFIED_CLIENT_ROUTE } from '../src/index'

const mocks = vi.hoisted(() => ({ spawn: vi.fn(), metadata: undefined as Record<string, string> | undefined }))
vi.mock('node:child_process', () => ({ spawn: mocks.spawn }))
vi.mock('node:module', async () => {
  const actual = await vi.importActual<typeof import('node:module')>('node:module')
  return { ...actual, findPackageJSON: (specifier: string, base: string | URL) => {
    const key = specifier === 'nuxtseo-shared' ? 'core' : String(base).endsWith('/src/index.ts') ? 'host' : String(base).includes('/devtools-layer/nuxt.config.ts') ? 'ui' : undefined
    return (key && mocks.metadata?.[key]) || actual.findPackageJSON(specifier, base)
  } }
})
const roots: string[] = []
const servers: ReturnType<typeof createServer>[] = []
const children: (EventEmitter & { stdout: PassThrough, stderr: PassThrough, kill: ReturnType<typeof vi.fn>, cwd: string })[] = []
const panel = { name: 'nuxt-fixture', title: 'Fixture', icon: 'carbon:test-tool', slug: 'fixture' }
beforeEach(() => {
  mocks.spawn.mockImplementation((_executable, _args, options) => {
    const child = Object.assign(new EventEmitter(), { stdout: new PassThrough(), stderr: new PassThrough(), kill: vi.fn(), cwd: options.cwd })
    children.push(child)
    return child
  })
})
afterEach(async () => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true })
  children.splice(0)
  mocks.spawn.mockReset()
  mocks.metadata = undefined
})
function consumer(devtools: Nuxt['options']['devtools'] = { enabled: true }) {
  const rootDir = mkdtempSync(join(tmpdir(), 'nuxtseo-host-'))
  roots.push(rootDir)
  mkdirSync(join(rootDir, 'panel/pages/fixture'), { recursive: true })
  mkdirSync(join(rootDir, 'node_modules'), { recursive: true })
  writeFileSync(join(rootDir, 'package.json'), JSON.stringify({ name: 'panel-fixture', version: '1.0.0' }))
  writeFileSync(join(rootDir, 'panel/nuxt.config.ts'), 'export default defineNuxtConfig({})')
  writeFileSync(join(rootDir, 'panel/pages/fixture/index.vue'), '<template>Fixture panel</template>')
  symlinkSync(join(import.meta.dirname, '../../../shared/node_modules/nuxt'), join(rootDir, 'node_modules/nuxt'))
  const hooks = new Map<string, ((...args: any[]) => unknown)[]>()
  const nuxt = { options: { dev: true, rootDir, devtools }, hook: (name: string, fn: (...args: any[]) => unknown) => {
    hooks.set(name, [...(hooks.get(name) || []), fn])
    return () => hooks.set(name, hooks.get(name)!.filter(item => item !== fn))
  } } as unknown as Nuxt
  const call = async (name: string, ...args: any[]) => {
    for (const fn of [...(hooks.get(name) || [])])
      await fn(...args)
  }
  return { rootDir, nuxt, hooks, call }
}
async function open(fixture: ReturnType<typeof consumer>) {
  await fixture.call('modules:done')
  let middleware: (...args: any[]) => void
  await fixture.call('vite:serverCreated', { middlewares: { use: (_route: string, handler: (...args: any[]) => void) => {
    middleware = handler
  } } })
  const server = createServer((req, res) => {
    req.url = req.url?.slice(UNIFIED_CLIENT_ROUTE.length) || '/'
    middleware(req, res, () => {
      res.statusCode = 404
      res.end()
    })
  })
  servers.push(server)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string')
    throw new Error('Missing test server')
  return `http://127.0.0.1:${address.port}${UNIFIED_CLIENT_ROUTE}`
}
function built(child = children.at(-1)!) {
  mkdirSync(join(child.cwd, 'dist/devtools/fixture'), { recursive: true })
  writeFileSync(join(child.cwd, 'dist/devtools/fixture/index.html'), '<html>Built panel</html>')
  writeFileSync(join(child.cwd, 'dist/devtools/200.html'), '<html>Built panel</html>')
  child.emit('exit', 0)
  child.emit('close', 0)
}

describe('optional DevTools host lifecycle', () => {
  it('registers one native iframe dock when modern DevTools becomes ready', async () => {
    const fixture = consumer()
    Object.assign(fixture.nuxt, { devtools: { extendServerRpc: vi.fn() } })
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const docks: unknown[] = []
    const context = { docks: { register: (entry: unknown) => docks.push(entry) } }
    await fixture.call('devtools:initialized', { version: '4.0.0-beta.3' })
    await fixture.call('devtools:ready', context)
    await fixture.call('devtools:ready', context)
    expect(docks).toEqual([{ id: 'nuxt-seo-fixture', title: 'Fixture', icon: 'carbon:test-tool', type: 'iframe', url: '/__nuxt-seo-devtools/fixture', groupId: 'nuxt' }])
    const legacyTabs: unknown[] = []
    await fixture.call('devtools:customTabs', legacyTabs)
    expect(legacyTabs).toEqual([])
    expect(mocks.spawn).not.toHaveBeenCalled()
  })
  it('keeps one native DevTools 3 tab after initialization without the modern ready hook', async () => {
    const fixture = consumer()
    Object.assign(fixture.nuxt, { devtools: { extendServerRpc: vi.fn() }, callHook: fixture.call })
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const before: unknown[] = []
    await fixture.call('devtools:customTabs', before)
    expect(before).toEqual([])
    await fixture.call('devtools:initialized', { version: '3.4.2' })
    await fixture.call('devtools:initialized', { version: '3.4.2' })
    const tabs: unknown[] = []
    await fixture.call('devtools:customTabs', tabs)
    expect(tabs).toEqual([{ name: 'nuxt-seo-fixture', title: 'Fixture', icon: 'carbon:test-tool', view: { type: 'iframe', src: '/__nuxt-seo-devtools/fixture' } }])
    expect(mocks.spawn).not.toHaveBeenCalled()
  })
  it.each([false, { enabled: false }])('does not register disabled panels or RPC: %j', async (devtools) => {
    const fixture = consumer(devtools)
    setupDevToolsUI(panel, path => join(fixture.rootDir, 'panel', path), fixture.nuxt)
    await expect(setupDevToolsRpc('fixture', {}, fixture.nuxt)).resolves.toBeUndefined()
    expect(fixture.hooks.size).toBe(0)
    expect(mocks.spawn).not.toHaveBeenCalled()
  })
  it('builds once after opening, preserves progress, serves the result and reuses a matching cache', async () => {
    const fixture = consumer()
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const url = await open(fixture)
    expect(mocks.spawn).not.toHaveBeenCalled()
    expect((await fetch(`${url}/__status`).then(r => r.json())).ready).toBe(false)
    expect(mocks.spawn).not.toHaveBeenCalled()
    await Promise.all([fetch(`${url}/fixture`), fetch(`${url}/fixture`)])
    expect(mocks.spawn).toHaveBeenCalledTimes(1)
    children[0].stdout.emit('data', Buffer.from('ℹ Building assets\n'))
    expect((await fetch(`${url}/__status`).then(r => r.json())).step).toBe('ℹ Building assets')
    built()
    expect(await fetch(`${url}/fixture`).then(r => r.text())).toContain('Built panel')
    const reopened = { ...fixture, nuxt: { ...fixture.nuxt }, hooks: new Map() }
    // A second session uses the same installed layer and project cache.
    const hooks = new Map<string, ((...args: any[]) => unknown)[]>()
    reopened.nuxt = { options: fixture.nuxt.options, hook: (name: string, fn: (...args: any[]) => unknown) => {
      hooks.set(name, [...(hooks.get(name) || []), fn])
      return () => {}
    } } as unknown as Nuxt
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), reopened.nuxt)
    for (const fn of hooks.get('modules:done') || [])
      await fn()
    let handler: any
    for (const fn of hooks.get('vite:serverCreated') || []) {
      await fn({ middlewares: { use: (_route: string, fn: any) => {
        handler = fn
      } } })
    }
    const result: string[] = []
    handler({ url: '/__status' }, { setHeader() {}, end(value: string) {
      result.push(value)
    } }, () => {})
    expect(JSON.parse(result[0]).ready).toBe(true)
    expect(mocks.spawn).toHaveBeenCalledTimes(1)
  })
  it('shows build failure until an explicit retry and cleans up a running child', async () => {
    const fixture = consumer()
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const url = await open(fixture)
    await fetch(`${url}/fixture`)
    children[0].emit('exit', 1)
    expect((await fetch(`${url}/__status`).then(r => r.json())).failed).toBe(true)
    await fetch(`${url}/__status`)
    expect(mocks.spawn).toHaveBeenCalledTimes(1)
    expect((await fetch(`${url}/__retry`)).status).toBe(405)
    expect((await fetch(`${url}/__install`)).status).toBe(405)
    expect((await fetch(`${url}/__retry`, { method: 'POST', headers: { origin: 'https://untrusted.example' } })).status).toBe(403)
    await fetch(`${url}/__retry`, { method: 'POST' })
    expect(mocks.spawn).toHaveBeenCalledTimes(2)
    await fixture.call('close')
    expect(children[1].kill).toHaveBeenCalledTimes(1)
  })
  it('invalidates an existing cache when a panel changes without a version bump', async () => {
    const fixture = consumer()
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const url = await open(fixture)
    await fetch(`${url}/fixture`)
    built()
    writeFileSync(join(fixture.rootDir, 'panel/pages/fixture/index.vue'), '<template>Updated panel</template>')
    // Recheck the cache before another session opens the updated layer.
    await fixture.call('modules:done')
    // Existing active sessions keep their current built client. New setup must rebuild.
    const next = consumer()
    next.nuxt.options.rootDir = fixture.rootDir
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), next.nuxt)
    const nextUrl = await open(next)
    await fetch(`${nextUrl}/fixture`)
    expect(mocks.spawn).toHaveBeenCalledTimes(2)
  })
  it.each(['host', 'core', 'ui'])('rebuilds when the %s package version changes', async (name) => {
    const fixture = consumer()
    const metadata: Record<string, string> = {}
    for (const key of ['host', 'core', 'ui']) {
      metadata[key] = join(fixture.rootDir, `${key}.json`)
      writeFileSync(metadata[key], JSON.stringify({ version: '1.0.0' }))
    }
    mocks.metadata = metadata
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const url = await open(fixture)
    await fetch(`${url}/fixture`)
    built()
    writeFileSync(metadata[name], JSON.stringify({ version: '1.0.1' }))
    const next = consumer()
    next.nuxt.options.rootDir = fixture.rootDir
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), next.nuxt)
    const nextUrl = await open(next)
    await fetch(`${nextUrl}/fixture`)
    expect(mocks.spawn).toHaveBeenCalledTimes(2)
  })
  it('keeps the dev server available when UI metadata is broken and retries after repair', async () => {
    const fixture = consumer()
    const manifest = join(fixture.rootDir, 'missing-ui.json')
    mocks.metadata = { ui: manifest }
    setupDevToolsUI(panel, () => join(fixture.rootDir, 'panel'), fixture.nuxt)
    const url = await open(fixture)
    const status = await fetch(`${url}/__status`).then(r => r.json())
    expect(status.failed).toBe(true)
    expect(status.step).toContain('ENOENT')
    expect(mocks.spawn).not.toHaveBeenCalled()
    writeFileSync(manifest, JSON.stringify({ version: '6.0.0' }))
    await fetch(`${url}/__retry`, { method: 'POST' })
    expect(mocks.spawn).toHaveBeenCalledTimes(1)
    built()
    expect(await fetch(`${url}/fixture`).then(r => r.text())).toContain('Built panel')
  })
})

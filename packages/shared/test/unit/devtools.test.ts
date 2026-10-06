import type { Nuxt } from 'nuxt/schema'
import { EventEmitter } from 'node:events'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setupDevToolsRpc, setupDevToolsUI } from '../../src/devtools'

const roots: string[] = []
const mocks = vi.hoisted(() => ({ spawn: vi.fn(), command: vi.fn(async () => 'pnpm add --save-dev nuxtseo-devtools-host@1.0.0') }))
vi.mock('node:child_process', () => ({ spawn: mocks.spawn }))
vi.mock('@nuxt/kit', async () => ({ ...await vi.importActual('@nuxt/kit'), getAddDependencyCommand: mocks.command }))
afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true })
  mocks.spawn.mockReset()
  mocks.command.mockClear()
})
function consumer(dev = true) {
  const rootDir = mkdtempSync(join(tmpdir(), 'nuxtseo-devtools-'))
  roots.push(rootDir)
  const hooks = new Map<string, (...args: any[]) => unknown>()
  const nuxt = { options: { dev, rootDir }, hook: (name: string, fn: (...args: any[]) => unknown) => {
    hooks.set(name, fn)
    return () => hooks.delete(name)
  } } as unknown as Nuxt
  return { nuxt, rootDir, hooks }
}
const panel = { name: 'nuxt-fixture', title: 'Fixture', icon: 'carbon:test-tool' }
function writeHost(rootDir: string, source: string) {
  const dir = join(rootDir, 'node_modules/nuxtseo-devtools-host')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ type: 'module', version: '1.0.0', exports: { '.': './index.mjs', './package.json': './package.json' } }))
  writeFileSync(join(dir, 'index.mjs'), source)
}
describe('optional DevTools host', () => {
  it.each([false, { enabled: false }])('does not load a host when DevTools is disabled: %j', async (devtools) => {
    const { nuxt, rootDir, hooks } = consumer()
    nuxt.options.devtools = devtools
    writeHost(rootDir, 'throw new Error("Host executed while DevTools disabled")')
    setupDevToolsUI(panel, path => path, nuxt)
    await expect(setupDevToolsRpc('fixture', {}, nuxt)).resolves.toBeUndefined()
    expect(hooks.size).toBe(0)
  })
  it('offers an explicit exact-version action without loading a missing host', async () => {
    const { nuxt, hooks } = consumer()
    setupDevToolsUI(panel, path => path, nuxt)
    const tabs: any[] = []
    hooks.get('devtools:customTabs')!(tabs)
    expect(tabs[0].view.type).toBe('launch')
    expect(tabs[0].view.actions[0].label).toBe('Install nuxtseo-devtools-host@1.0.0')
    await expect(setupDevToolsRpc('fixture', {}, nuxt)).resolves.toBeUndefined()
    expect(hooks.has('vite:serverCreated')).toBe(false)
    expect(mocks.spawn).not.toHaveBeenCalled()
    expect(mocks.command).not.toHaveBeenCalled()
  })
  it('deduplicates explicit installation, surfaces failure and allows retry', async () => {
    const { nuxt, hooks, rootDir } = consumer()
    const children: (EventEmitter & { kill: ReturnType<typeof vi.fn> })[] = []
    mocks.spawn.mockImplementation(() => {
      const child = Object.assign(new EventEmitter(), { kill: vi.fn() })
      children.push(child)
      return child
    })
    setupDevToolsUI(panel, path => path, nuxt)
    const tabs: any[] = []
    hooks.get('devtools:customTabs')!(tabs)
    const action = tabs[0].view.actions[0].handle
    const failed = Promise.allSettled([action(), action()])
    await vi.waitFor(() => expect(mocks.spawn).toHaveBeenCalledTimes(1))
    children[0].emit('exit', 1)
    children[0].emit('close', 1)
    expect((await failed).map(result => result.status)).toEqual(['rejected', 'rejected'])
    const failure: any[] = []
    hooks.get('devtools:customTabs')!(failure)
    expect(failure[0].view.description).toContain('Installation failed')
    expect(failure[0].view.actions[0].pending).toBe(false)
    expect(mocks.command).toHaveBeenCalledWith('nuxtseo-devtools-host@1.0.0', rootDir, { dev: true })
    const retry = action()
    await vi.waitFor(() => expect(mocks.spawn).toHaveBeenCalledTimes(2))
    hooks.get('close')!()
    expect(children[1].kill).toHaveBeenCalledTimes(1)
    children[1].emit('exit', 0)
    children[1].emit('close', 0)
    await retry
    const installed: any[] = []
    hooks.get('devtools:customTabs')!(installed)
    expect(installed[0].view.description).toContain('Restart')
    expect(installed[0].view.actions).toEqual([])
    expect(hooks.has('close')).toBe(false)
  })
  it('does not execute even an installed host in production', async () => {
    const { nuxt, rootDir, hooks } = consumer(false)
    writeHost(rootDir, 'throw new Error("Host executed during production")')
    setupDevToolsUI(panel, path => path, nuxt)
    await expect(setupDevToolsRpc('fixture', {}, nuxt)).resolves.toBeUndefined()
    expect(hooks.size).toBe(0)
  })
  it('registers installed host hooks synchronously before setup returns', () => {
    const { nuxt, rootDir, hooks } = consumer()
    writeHost(rootDir, 'export function setupDevToolsUI(config, resolve, nuxt) { nuxt.hook("vite:serverCreated", () => config.title) }')
    setupDevToolsUI(panel, path => path, nuxt)
    expect(hooks.get('vite:serverCreated')!()).toBe('Fixture')
  })
})

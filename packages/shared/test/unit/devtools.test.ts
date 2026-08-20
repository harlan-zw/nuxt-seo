import type { Nuxt } from 'nuxt/schema'
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterEach, expect, it, vi } from 'vitest'
import { setupDevToolsUI } from '../../src/devtools'

vi.mock('node:child_process', async (importOriginal) => {
  const original = await importOriginal<typeof import('node:child_process')>()
  return {
    ...original,
    spawn: vi.fn(() => ({
      stdout: null,
      stderr: null,
      on() {
        return this
      },
    })),
  }
})

vi.mock('@nuxt/devtools-kit', () => ({
  addCustomTab: vi.fn(),
  extendServerRpc: vi.fn(),
  onDevToolsInitialized: vi.fn(),
  startSubprocess: vi.fn(),
}))

type Hook = (...args: unknown[]) => unknown
type Middleware = (
  request: { url?: string },
  response: { setHeader: (name: string, value: string) => void, end: (body: string) => void },
  next: () => void,
) => unknown

const temporaryRoots: string[] = []

afterEach(() => {
  for (const root of temporaryRoots.splice(0))
    rmSync(root, { recursive: true, force: true })
})

function writePackage(root: string, name: string): void {
  const packageDir = join(root, 'node_modules', name)
  mkdirSync(packageDir, { recursive: true })
  writeFileSync(join(packageDir, 'index.js'), '')
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ name, main: './index.js' }))
}

it('loads the generated client config with only the required layer installed', () => {
  const root = mkdtempSync(join(tmpdir(), 'nuxtseo-devtools-consumer-'))
  temporaryRoots.push(root)
  writePackage(root, 'nuxtseo-layer-devtools')

  const moduleDir = join(root, 'module')
  mkdirSync(join(moduleDir, 'devtools'), { recursive: true })
  writeFileSync(join(moduleDir, 'devtools/nuxt.config.ts'), 'export default defineNuxtConfig({})\n')

  const hooks = new Map<string, Hook>()
  const nuxt = {
    options: { dev: true, rootDir: root },
    hook(name: string, hook: Hook) {
      hooks.set(name, hook)
    },
  } as unknown as Nuxt

  setupDevToolsUI({
    name: 'nuxt-fixture',
    title: 'Fixture',
    icon: 'carbon:test-tool',
  }, path => join(moduleDir, path), nuxt)

  let middleware: Middleware | undefined
  hooks.get('vite:serverCreated')?.({
    middlewares: {
      use(_route: string, handler: Middleware) {
        middleware = handler
      },
    },
  })
  expect(middleware).toBeDefined()

  const headers = new Map<string, string>()
  middleware?.(
    { url: '/__status' },
    {
      setHeader: (name, value) => headers.set(name, value),
      end: () => {},
    },
    () => {},
  )

  const configPath = join(root, 'node_modules/.cache/nuxt-seo-devtools/nuxt.config.ts')
  const importableConfigPath = join(root, 'node_modules/.cache/nuxt-seo-devtools/nuxt.config.mjs')
  // Node does not type-strip TypeScript files under node_modules.
  // The copy keeps dependency resolution rooted in the generated cache.
  copyFileSync(configPath, importableConfigPath)
  const output = execFileSync(process.execPath, ['--input-type=module', '--eval', `
globalThis.defineNuxtConfig = config => config
const { default: config } = await import(process.env.NUXTSEO_CONFIG_URL)
process.stdout.write(JSON.stringify({ ssr: config.ssr }))
`], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      NUXTSEO_CONFIG_URL: pathToFileURL(importableConfigPath).href,
    },
  })

  expect(JSON.parse(output)).toEqual({ ssr: false })
})

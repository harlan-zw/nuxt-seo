import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire, findPackageJSON } from 'node:module'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getAddDependencyCommand, useLogger, useNuxt } from '@nuxt/kit'

export const UNIFIED_CLIENT_ROUTE = '/__nuxt-seo-devtools'
const HOST_PACKAGE = 'nuxtseo-devtools-host@1.0.0'
export interface DevToolsUIConfig {
  route?: string
  name: string
  title: string
  icon: string
  slug?: string
  devPort?: number
}
export interface SeoModuleInfo { name: string, disabled?: boolean, npm?: string, title: string, icon: string, route: string }
type Broadcast<F> = F extends (...args: infer A) => infer R
  ? ((...args: A) => Promise<Awaited<R>[]>) & { asEvent: (...args: A) => void }
  : never
export interface BirpcGroup<ClientFunctions extends object, _ServerFunctions extends object = object> {
  broadcast: { [K in keyof ClientFunctions]: Broadcast<ClientFunctions[K]> }
}
interface DevToolsHost {
  setupDevToolsUI: (config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt) => void
  setupDevToolsRpc: <S extends object, C extends object>(namespace: string, functions: S, nuxt: Nuxt) => Promise<BirpcGroup<C, S>>
}
function loadHost(nuxt: Nuxt): DevToolsHost | undefined {
  const require = createRequire(join(nuxt.options.rootDir, 'package.json'))
  let entry: string
  try {
    const metadataPath = findPackageJSON('nuxtseo-devtools-host', pathToFileURL(join(nuxt.options.rootDir, 'package.json')))
    if (!metadataPath)
      return undefined
    const metadata: unknown = JSON.parse(readFileSync(metadataPath, 'utf8'))
    if (!metadata || typeof metadata !== 'object' || !('version' in metadata) || typeof metadata.version !== 'string' || !metadata.version.startsWith('1.')) {
      useLogger('nuxt-seo').warn(`Install ${HOST_PACKAGE} to use this DevTools integration.`)
      return undefined
    }
    entry = require.resolve('nuxtseo-devtools-host')
  }
  catch (error) {
    if (error && typeof error === 'object' && 'code' in error && (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND'))
      return undefined
    throw error
  }
  // Node22 require(ESM) keeps early host hooks synchronous. Only development calls reach this boundary.
  return require(entry) as DevToolsHost
}
const installs = new WeakMap<Nuxt, Promise<void>>()
async function installHost(nuxt: Nuxt): Promise<void> {
  const pending = installs.get(nuxt)
  if (pending)
    return pending
  const operation = (async () => {
    const command = await getAddDependencyCommand(HOST_PACKAGE, nuxt.options.rootDir, { dev: true })
    const [executable, ...args] = command.split(' ')
    await new Promise<void>((resolve, reject) => {
      const child = spawn(executable!, args, { cwd: nuxt.options.rootDir, stdio: 'inherit' })
      const unhook = nuxt.hook('close', () => {
        child.kill()
      })
      child.once('close', unhook)
      child.once('error', reject)
      child.once('exit', code => code === 0 ? resolve() : reject(new Error(`DevTools package installation failed with exit code ${code}.`)))
    })
  })()
  installs.set(nuxt, operation)
  try {
    await operation
  }
  finally {
    installs.delete(nuxt)
  }
}
export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  if (!nuxt.options.dev || nuxt.options.devtools === false || (typeof nuxt.options.devtools === 'object' && nuxt.options.devtools.enabled === false))
    return
  const host = loadHost(nuxt)
  if (host) {
    host.setupDevToolsUI(config, resolve, nuxt)
    return
  }
  let installed = false
  let pending = false
  let failure: string | undefined
  const hook = nuxt.hook as (name: string, callback: (tabs: LaunchTab[]) => void) => () => void
  hook('devtools:customTabs', (tabs) => {
    tabs.push({ name: `nuxt-seo-${config.slug ?? config.name}`, title: config.title, icon: config.icon, view: { type: 'launch', description: installed
      ? 'Restart the Nuxt dev server to load Nuxt SEO DevTools.'
      : failure ?? `Install ${HOST_PACKAGE} as a development dependency to open this panel.`, actions: installed
      ? []
      : [{ label: `Install ${HOST_PACKAGE}`, pending, handle: async () => {
          pending = true
          failure = undefined
          try {
            await installHost(nuxt)
            installed = true
          }
          catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            failure = `Installation failed: ${message} Choose Install to retry.`
            throw error
          }
          finally {
            pending = false
          }
        } }] } })
  })
}
interface LaunchTab {
  name: string
  title: string
  icon: string
  view: { type: 'launch', description: string, actions: { label: string, pending: boolean, handle: () => Promise<void> }[] }
}
export function setupDevToolsRpc<S extends object, C extends object>(namespace: string, functions: S, nuxt: Nuxt = useNuxt()): Promise<BirpcGroup<C, S> | undefined> {
  if (!nuxt.options.dev || nuxt.options.devtools === false || (typeof nuxt.options.devtools === 'object' && nuxt.options.devtools.enabled === false))
    return Promise.resolve(undefined)
  return loadHost(nuxt)?.setupDevToolsRpc<S, C>(namespace, functions, nuxt) ?? Promise.resolve(undefined)
}

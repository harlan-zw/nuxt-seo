import type { Nuxt } from '@nuxt/schema'
import type { Nitro } from 'nitropack'
import type { NitroConfig } from 'nitropack/types'
import type { NuxtModule, NuxtPage } from 'nuxt/schema'
import { readFile } from 'node:fs/promises'
import { findPackageJSON } from 'node:module'
import { relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { addTemplate, createResolver, getNitroVersion, hasNuxtModule, hasNuxtModuleCompatibility, loadNuxtModuleInstance, tryUseNuxt, useLogger, useNuxt } from '@nuxt/kit'
import { env, provider } from 'std-env'

export type { NitroRuntimeCompatibility, NitroTypeAugmentations } from './nitro-compatibility'
export { renderNitroTypeAugmentations, setupNitroRuntimeCompatibility } from './nitro-compatibility'
export type { RuntimeAliasOptions } from './runtime-aliases'
export { setupRuntimeAliases } from './runtime-aliases'

export interface NuxtSeoModuleDetection {
  name: string
  version?: string
  entryPath?: string
  features?: Record<string, boolean | string | number>
}

function normalizePackageUrl(rootDir: string): string {
  const url = rootDir.startsWith('file:')
    ? rootDir
    : pathToFileURL(rootDir.endsWith('/') ? rootDir : `${rootDir}/`).href
  return url.endsWith('/') ? url : `${url}/`
}

async function readPackageVersion(id: string, rootDir: string): Promise<string | undefined> {
  const path = await Promise.resolve().then(() => findPackageJSON(id, new URL('package.json', normalizePackageUrl(rootDir)))).catch((error: unknown) => {
    if (error && typeof error === 'object' && 'code' in error && (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ENOENT'))
      return undefined
    throw error
  })
  if (!path)
    return undefined
  const metadata: unknown = JSON.parse(await readFile(path, 'utf8'))
  return metadata && typeof metadata === 'object' && 'version' in metadata && typeof metadata.version === 'string'
    ? metadata.version
    : undefined
}

const NUXT_SEO_MODULES = new Set([
  '@nuxtjs/robots',
  '@nuxtjs/sitemap',
  'nuxt-og-image',
  'nuxt-schema-org',
  'nuxt-seo-utils',
  'nuxt-link-checker',
  'nuxt-site-config',
  'nuxt-skew-protection',
  'nuxt-ai-ready',
])

/**
 * Detect all installed Nuxt SEO modules from `nuxt.options._installedModules`.
 * No self-registration needed; modules are discovered automatically.
 */
export function detectNuxtSeoModules(nuxt: Nuxt = useNuxt()): NuxtSeoModuleDetection[] {
  return nuxt.options._installedModules
    .filter(m => m.meta?.name && NUXT_SEO_MODULES.has(m.meta.name))
    .map(m => ({
      name: m.meta.name!,
      version: m.meta.version,
      entryPath: m.entryPath,
    }))
}

export function useModuleLogger(name: string, options: { debug?: boolean }, nuxt: Nuxt = useNuxt()): ReturnType<typeof useLogger> {
  const logger = useLogger(name)
  logger.level = (options.debug || nuxt.options.debug) ? 4 : 3
  return logger
}

const autodetectableProviders: Record<string, string> = {
  azure_static: 'azure',
  cloudflare_pages: 'cloudflare-pages',
  netlify: 'netlify',
  stormkit: 'stormkit',
  vercel: 'vercel',
  cleavr: 'cleavr',
  stackblitz: 'stackblitz',
}

const autodetectableStaticProviders: Record<string, string> = {
  netlify: 'netlify-static',
  vercel: 'vercel-static',
}

export function detectTarget(options: { static?: boolean } = {}): string | undefined {
  return options?.static ? autodetectableStaticProviders[provider] : autodetectableProviders[provider]
}

export function resolveNitroPreset(nitroConfig?: NitroConfig): string {
  nitroConfig = nitroConfig || (tryUseNuxt()?.options as any)?.nitro
  if (provider === 'stackblitz' || provider === 'codesandbox')
    return provider
  let preset
  if (nitroConfig && nitroConfig?.preset)
    preset = nitroConfig.preset
  if (!preset)
    preset = env.NITRO_PRESET || env.SERVER_PRESET || detectTarget() || 'node-server'
  return preset.replaceAll('_', '-')
}

/**
 * Get the user provided options for a Nuxt module.
 *
 * These options may not be the resolved options that the module actually uses.
 */
export async function getNuxtModuleOptions(module: string | NuxtModule, nuxt: Nuxt = useNuxt()): Promise<Record<string, any>> {
  const moduleMeta = (typeof module === 'string' ? { name: module } : await module.getMeta?.()) || {}
  const { nuxtModule } = (await loadNuxtModuleInstance(module, nuxt))

  let moduleEntry: [string | NuxtModule, Record<string, any>] | undefined
  for (const m of nuxt.options.modules) {
    if (Array.isArray(m) && m.length >= 2) {
      const _module = m[0]
      const _moduleEntryName = typeof _module === 'string'
        ? _module
        : (await (_module as any as NuxtModule).getMeta?.())?.name || ''
      if (_moduleEntryName === moduleMeta.name)
        moduleEntry = m as [string | NuxtModule, Record<string, any>]
    }
  }

  let inlineOptions = {}
  if (moduleEntry)
    inlineOptions = moduleEntry[1]
  if (nuxtModule.getOptions)
    return nuxtModule.getOptions(inlineOptions, nuxt)
  return inlineOptions
}

export function isNuxtGenerate(nuxt: Nuxt = useNuxt()): boolean {
  const nitroOptions = (nuxt.options as any).nitro
  return nitroOptions?.static || (nuxt.options as any)._generate || [
    'static',
    'github-pages',
  ].includes(resolveNitroPreset(nitroOptions))
}

/**
 * Generate TypeScript type augmentations for a Nuxt module.
 */
export function extendTypes(module: string, template: (options: { typesPath: string }) => string | Promise<string>): void {
  const nuxt = useNuxt()
  const { resolve } = createResolver(import.meta.url)
  addTemplate({
    filename: `module/${module}.d.ts`,
    getContents: async () => {
      const typesPath = relative(resolve(nuxt!.options.rootDir, nuxt!.options.buildDir, 'module'), resolve('runtime/types')).split(sep).join('/')
      const s = await template({ typesPath })
      return `// Generated by ${module}\n${s}\nexport {}\n`
    },
  })

  nuxt.hooks.hook('prepare:types', ({ references }) => {
    references.push({ path: resolve(nuxt.options.buildDir, `module/${module}.d.ts`) })
  })
}

/**
 * Create a promise that resolves when Nuxt pages are resolved.
 */
export function createPagesPromise(nuxt: Nuxt = useNuxt()): Promise<NuxtPage[]> {
  return new Promise<NuxtPage[]>((resolve) => {
    nuxt.hooks.hook('modules:done', () => {
      if ((typeof nuxt.options.pages === 'boolean' && nuxt.options.pages === false) || (typeof nuxt.options.pages === 'object' && !nuxt.options.pages.enabled)) {
        return resolve([])
      }
      nuxt.hook('pages:resolved', pages => resolve(pages))
    })
  })
}

/**
 * Create a promise that resolves when Nitro is initialized.
 */
export function createNitroPromise(nuxt: Nuxt = useNuxt()): Promise<Nitro> {
  return new Promise<Nitro>((resolve) => {
    nuxt.hooks.hook('nitro:init' as any, (nitro: Nitro) => resolve(nitro))
  })
}

export interface NuxtContentVersion {
  version: 2 | 3
}

/**
 * Detect which version of @nuxt/content is installed.
 *
 * Returns `false` when @nuxt/content is not installed or the version is unrecognised.
 */
export async function resolveNuxtContentVersion(): Promise<false | NuxtContentVersion> {
  if (!hasNuxtModule('@nuxt/content'))
    return false
  if (await hasNuxtModuleCompatibility('@nuxt/content', '^3'))
    return { version: 3 }
  if (await hasNuxtModuleCompatibility('@nuxt/content', '^2'))
    return { version: 2 }
  return false
}

/**
 * Read the major version of a non-module package as resolved from `rootDir`.
 *
 * Unlike `hasNuxtModuleCompatibility`, this works for plain libraries (e.g.
 * `unhead`, `@unhead/vue`) that aren't registered as Nuxt modules. Returns
 * `undefined` when the package can't be resolved or has no parseable version.
 */
export async function resolvePackageMajor(id: string, rootDir: string): Promise<number | undefined> {
  const version = await readPackageVersion(id, rootDir)
  const major = version ? Number.parseInt(version, 10) : Number.NaN
  return Number.isFinite(major) ? major : undefined
}

export const COMARK_CONTENT_MODULE = '@harlan-zw/comark-content'

/**
 * The lowest comark-content that exposes `queryCollectionManifest` from
 * `@harlan-zw/comark-content/server`. Every integration here walks collections
 * through that manifest, so an older build has no first-party path.
 */
const COMARK_CONTENT_MINIMUM = [0, 1, 2] as const

/**
 * The Markdown content module backing this app, if any.
 *
 * `@nuxt/content` and `comark-content` both fire the `content:file:beforeParse`
 * and `content:file:afterParse` build hooks with the same context shape, so a
 * module's frontmatter handling is written once. They differ at runtime:
 * `@nuxt/content` queries a SQL database, comark reads Nitro server assets.
 */
export type ContentProvider
  = | { _tag: 'None' }
    | { _tag: 'NuxtContent', version: 2 | 3 }
    | { _tag: 'Comark' }

/**
 * comark declares no `version` in its module meta, so
 * `hasNuxtModuleCompatibility` reports false for every release. Read the
 * installed package instead.
 */
async function comarkSatisfiesMinimum(nuxt: Nuxt): Promise<boolean> {
  const version = await readPackageVersion(COMARK_CONTENT_MODULE, nuxt.options.rootDir)
  const parts = version?.split('.').map(part => Number.parseInt(part, 10))
  if (!parts || parts.length < 3 || parts.some(part => !Number.isFinite(part)))
    return false
  for (const [index, minimum] of COMARK_CONTENT_MINIMUM.entries()) {
    if (parts[index]! !== minimum)
      return parts[index]! > minimum
  }
  return true
}

/**
 * Detect which Markdown content module is installed.
 *
 * `@nuxt/content` wins when both are present: it owns the `content` config key
 * and its runtime is the one the app's pages query.
 */
export async function resolveContentProvider(nuxt: Nuxt = useNuxt()): Promise<ContentProvider> {
  const nuxtContent = await resolveNuxtContentVersion()
  if (nuxtContent)
    return { _tag: 'NuxtContent', version: nuxtContent.version }
  if (hasNuxtModule(COMARK_CONTENT_MODULE, nuxt) && await comarkSatisfiesMinimum(nuxt))
    return { _tag: 'Comark' }
  return { _tag: 'None' }
}

/**
 * Whether the provider fires the `content:file:*` build hooks, which is where
 * every module maps its frontmatter field onto the parsed page.
 */
export function hasContentFileHooks(provider: ContentProvider): boolean {
  return provider._tag === 'Comark' || (provider._tag === 'NuxtContent' && provider.version === 3)
}

/**
 * Alias `#nuxtseo/content` to the shim for the detected provider.
 *
 * Consumers import collection enumeration and page queries from that one
 * specifier instead of naming `@nuxt/content/server` or
 * `@harlan-zw/comark-content/server`. Naming a package directly would put it in
 * every build, and a build without that package installed fails to bundle.
 *
 * Nuxt Content v2 has no collection model, so it resolves to the empty shim.
 * A module that supports v2 keeps its own v2 path.
 */
export function setupContentRuntime(provider: ContentProvider, nuxt: Nuxt = useNuxt()): void {
  const shim = provider._tag === 'Comark'
    ? 'comark'
    : provider._tag === 'NuxtContent' && provider.version === 3
      ? 'nuxt-content-v3'
      : 'none'
  const resolver = createResolver(import.meta.url)
  // This package does not depend on nitro's option types, so narrow the two fields
  // it touches rather than pulling the whole NitroConfig augmentation in.
  const nitro = (nuxt.options as { nitro?: { alias?: Record<string, string>, externals?: { inline?: string[] } } }).nitro ??= {}
  nitro.alias ??= {}
  nitro.alias['#nuxtseo/content'] = resolver.resolve(`./runtime/content/${shim}`)
  if (getNitroVersion(nuxt) === 2) {
    // Nitro 2 needs the shim bundled so its build-time aliases resolve.
    // Nitro 3 bundles it without externals, which it no longer supports.
    nitro.externals ??= {}
    nitro.externals.inline ??= []
    nitro.externals.inline.push(resolver.resolve('./runtime/content/'))
  }
}

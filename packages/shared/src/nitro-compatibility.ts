import type { Nuxt } from '@nuxt/schema'
import { addTypeTemplate, directoryToURL, getNuxtVersion, resolveModule, useLogger, useNuxt } from '@nuxt/kit'

export type NitroRuntimeCompatibility
  = | {
    _tag: 'nitro-v2'
    eventContextModule: 'h3'
    eventContextType: 'H3EventContext'
    eventType: `import('h3').H3Event`
    nitroTypesModule: 'nitropack'
  }
  | {
    _tag: 'nitro-v3'
    eventContextModule: 'srvx'
    eventContextType: 'ServerRequestContext'
    eventType: `import('nitro/h3').H3Event`
    nitroTypesModule: 'nitro/types'
  }

export interface NitroTypeAugmentations {
  eventContext?: string
  nitroInterfaces?: Record<string, string>
  routeConfig?: string
  routeRules?: string
  runtimeHooks?: string
}

const NITRO_RUNTIME_MODULE = '#nuxtseo/nitro'
const H3_RUNTIME_MODULE = '#nuxtseo/h3'
const OFETCH_RUNTIME_MODULE = '#nuxtseo/ofetch'
const TYPE_TEMPLATE_FILENAME = 'types/nuxtseo-nitro.d.ts'
const legacySetupMarker = Symbol.for('nuxtseo:nitro-runtime-compatibility')
const typeSetupMarker = Symbol.for('nuxtseo:nitro-runtime-compatibility:request-context-types')
const runtimeSetupMarker = Symbol.for('nuxtseo:nitro-runtime-compatibility:request-context')

interface NuxtNitroCompatibilityOptions {
  alias?: Record<string, string>
  externals?: {
    inline?: (string | RegExp)[]
  }
  typescript?: {
    tsConfig?: {
      compilerOptions?: {
        paths?: Record<string, string[]>
      }
    }
  }
  virtual?: Record<string, string>
}

const nitroV2Compatibility: NitroRuntimeCompatibility = {
  _tag: 'nitro-v2',
  eventContextModule: 'h3',
  eventContextType: 'H3EventContext',
  eventType: `import('h3').H3Event`,
  nitroTypesModule: 'nitropack',
}

const nitroV3Compatibility: NitroRuntimeCompatibility = {
  _tag: 'nitro-v3',
  eventContextModule: 'srvx',
  eventContextType: 'ServerRequestContext',
  eventType: `import('nitro/h3').H3Event`,
  nitroTypesModule: 'nitro/types',
}

const nitroV2Runtime = `export {
  defineNitroPlugin,
  useNitroApp,
  useEvent,
  useRuntimeConfig,
  defineCachedFunction,
  defineCachedEventHandler,
  useStorage,
  defineTask,
  runTask,
} from 'nitropack/runtime'
export function fetchWithEvent(event, request, options) {
  return event.$fetch(request, options)
}
export function fetchRawWithEvent(event, request, init) {
  return event.fetch(request, init)
}
`

const nitroV2RuntimeTypes = `export {
  defineNitroPlugin,
  useNitroApp,
  useEvent,
  useRuntimeConfig,
  defineCachedFunction,
  defineCachedEventHandler,
  useStorage,
  defineTask,
  runTask,
} from 'nitropack/runtime'
export function fetchWithEvent<T>(event: import('h3').H3Event, request: import('ofetch').FetchRequest, options?: import('ofetch').FetchOptions): Promise<T>
export function fetchRawWithEvent(event: import('h3').H3Event, request: RequestInfo | URL, init?: RequestInit): Promise<Response>
`

const nitroV3Runtime = `import { createFetch } from '${OFETCH_RUNTIME_MODULE}'
import { fetchWithEvent as fetchH3WithEvent, getProxyRequestHeaders } from 'nitro/h3'
import { useNitroApp as _useNitroApp } from 'nitro/app'
export { definePlugin as defineNitroPlugin } from 'nitro'
export { useNitroApp } from 'nitro/app'
export { useRequest as useEvent } from 'nitro/context'
import { useRuntimeConfig as _useRuntimeConfig } from 'nitro/runtime-config'
export function useRuntimeConfig(_event) { return _useRuntimeConfig() }
export { defineCachedFunction, defineCachedHandler as defineCachedEventHandler } from 'nitro/cache'
export { useStorage } from 'nitro/storage'
export { defineTask, runTask } from 'nitro/task'
function fetchRaw(event, input, init) {
  if (typeof input !== 'string' || !input.startsWith('/'))
    return fetchH3WithEvent(event, input, init)
  const headers = new Headers(getProxyRequestHeaders(event, { host: true }))
  for (const [name, value] of new Headers(init?.headers))
    headers.set(name, value)
  const request = new Request(new URL(input, event.url), { ...init, headers })
  request.runtime = event.req.runtime
  request.waitUntil = event.req.waitUntil
  request.ip = event.req.ip
  return _useNitroApp().fetch(request)
}
export function fetchRawWithEvent(event, request, init) {
  return fetchRaw(event, request, init)
}
export function fetchWithEvent(event, request, options) {
  const localFetch = createFetch({
    fetch: (input, init) => fetchRaw(event, input, init),
  })
  return localFetch(request, options)
}
`

const nitroV3RuntimeTypes = `export { definePlugin as defineNitroPlugin } from 'nitro'
export { useNitroApp } from 'nitro/app'
export { useRequest as useEvent } from 'nitro/context'
export function useRuntimeConfig(event?: import('nitro/h3').H3Event): ReturnType<typeof import('nitro/runtime-config').useRuntimeConfig>
export { defineCachedFunction, defineCachedHandler as defineCachedEventHandler } from 'nitro/cache'
export { useStorage } from 'nitro/storage'
export { defineTask, runTask } from 'nitro/task'
export function fetchWithEvent<T>(event: import('nitro/h3').H3Event, request: import('ofetch').FetchRequest, options?: import('ofetch').FetchOptions): Promise<T>
export function fetchRawWithEvent(event: import('nitro/h3').H3Event, request: RequestInfo | URL, init?: RequestInit): Promise<Response>
`

function indent(value: string, spaces: number): string {
  const padding = ' '.repeat(spaces)
  return value.split('\n').map(line => `${padding}${line}`).join('\n')
}

function renderInterface(name: string, contents?: string): string | undefined {
  if (!contents?.trim())
    return undefined
  return `  interface ${name} {\n${indent(contents.trim(), 4)}\n  }`
}

function renderRuntimeDeclarations(compatibility: NitroRuntimeCompatibility): string {
  const nitroRuntime = compatibility._tag === 'nitro-v3' ? nitroV3RuntimeTypes : nitroV2RuntimeTypes
  const h3Runtime = compatibility._tag === 'nitro-v3'
    ? `export * from 'nitro/h3'\n`
    : `export * from 'h3'\n`

  return `declare module '${NITRO_RUNTIME_MODULE}' {
${indent(nitroRuntime.trim(), 2)}
}

declare module '${H3_RUNTIME_MODULE}' {
${indent(h3Runtime.trim(), 2)}
}
`
}

type RuntimeModuleResolution
  = | { _tag: 'resolved', path: string }
    | { _tag: 'unresolved', cause: unknown }

function resolveRuntimeModule(nuxt: Nuxt, id: string): RuntimeModuleResolution {
  try {
    // Resolve from the project first: `nitro/h3` only exists in the consuming app's
    // dependency tree, and under a strict pnpm layout `h3` is not guaranteed to be
    // reachable from this package either.
    return {
      _tag: 'resolved',
      path: resolveModule(id, {
        url: [...nuxt.options.modulesDir.map(directoryToURL), new URL(import.meta.url)],
      }),
    }
  }
  catch (cause) {
    return { _tag: 'unresolved', cause }
  }
}

function applyNitroRuntimeCompatibility(
  nuxt: Nuxt,
  compatibility: NitroRuntimeCompatibility,
  reportResolutionFailure = false,
): void {
  const nuxtOptions = nuxt.options as Nuxt['options'] & { nitro?: NuxtNitroCompatibilityOptions }
  const nitroOptions = nuxtOptions.nitro ||= {}
  nitroOptions.alias ||= {}
  nitroOptions.externals ||= {}
  nitroOptions.externals.inline ||= []
  nitroOptions.virtual ||= {}
  // Vercel can omit traced shared subpaths from deployed functions: https://github.com/harlan-zw/nuxt-seo/issues/623
  if (!nitroOptions.externals.inline.includes('nuxtseo-shared'))
    nitroOptions.externals.inline.push('nuxtseo-shared')
  const h3RuntimeModule = compatibility._tag === 'nitro-v3' ? 'nitro/h3' : 'h3'
  nitroOptions.alias[H3_RUNTIME_MODULE] = h3RuntimeModule
  const h3Resolution = resolveRuntimeModule(nuxt, h3RuntimeModule)
  if (h3Resolution._tag === 'resolved') {
    nitroOptions.typescript ||= {}
    nitroOptions.typescript.tsConfig ||= {}
    nitroOptions.typescript.tsConfig.compilerOptions ||= {}
    nitroOptions.typescript.tsConfig.compilerOptions.paths ||= {}
    nitroOptions.typescript.tsConfig.compilerOptions.paths[H3_RUNTIME_MODULE] = [h3Resolution.path]
  }
  else if (reportResolutionFailure) {
    useLogger('nuxtseo-shared').warn(
      `Could not resolve Nitro runtime module '${h3RuntimeModule}'. Generated server types may be incomplete.`,
      h3Resolution.cause,
    )
  }
  if (compatibility._tag === 'nitro-v3')
    nitroOptions.alias[OFETCH_RUNTIME_MODULE] = resolveModule('ofetch', { url: new URL(import.meta.url) })
  nitroOptions.virtual[NITRO_RUNTIME_MODULE] = compatibility._tag === 'nitro-v3' ? nitroV3Runtime : nitroV2Runtime
}

export function renderNitroTypeAugmentations(
  compatibility: NitroRuntimeCompatibility,
  augmentations: NitroTypeAugmentations,
): string {
  const nitroInterfaces = [
    renderInterface('NitroRouteRules', augmentations.routeRules),
    renderInterface('NitroRouteConfig', augmentations.routeConfig),
    renderInterface('NitroRuntimeHooks', augmentations.runtimeHooks),
    ...Object.entries(augmentations.nitroInterfaces || {}).map(([name, contents]) => renderInterface(name, contents)),
  ].filter((value): value is string => Boolean(value))

  const declarations: string[] = []
  if (nitroInterfaces.length) {
    const nitroTypeModules = compatibility._tag === 'nitro-v2'
      ? ['nitropack', 'nitropack/types']
      : [compatibility.nitroTypesModule]
    declarations.push(...nitroTypeModules.map(module => `declare module '${module}' {\n${nitroInterfaces.join('\n')}\n}`))
  }
  if (augmentations.eventContext?.trim()) {
    declarations.push(`declare module '${compatibility.eventContextModule}' {\n${renderInterface(compatibility.eventContextType, augmentations.eventContext)}\n}`)
  }
  return declarations.join('\n\n')
}

export function setupNitroRuntimeCompatibility(nuxt: Nuxt = useNuxt()): NitroRuntimeCompatibility {
  const major = Number.parseInt(getNuxtVersion(nuxt), 10)
  const compatibility = major >= 5 ? nitroV3Compatibility : nitroV2Compatibility
  applyNitroRuntimeCompatibility(nuxt, compatibility)

  const nuxtWithLegacyMarker = nuxt as Nuxt & { [legacySetupMarker]?: true }
  nuxtWithLegacyMarker[legacySetupMarker] = true

  const nuxtWithRuntimeMarker = nuxt as Nuxt & { [runtimeSetupMarker]?: true }
  if (!nuxtWithRuntimeMarker[runtimeSetupMarker]) {
    nuxtWithRuntimeMarker[runtimeSetupMarker] = true
    nuxt.hooks.hookOnce('modules:done', () => applyNitroRuntimeCompatibility(nuxt, compatibility, true))
  }

  const nuxtWithTypeMarker = nuxt as Nuxt & { [typeSetupMarker]?: true }
  if (!nuxtWithTypeMarker[typeSetupMarker]) {
    nuxtWithTypeMarker[typeSetupMarker] = true
    addTypeTemplate({
      filename: TYPE_TEMPLATE_FILENAME,
      getContents: async () => renderRuntimeDeclarations(compatibility),
    }, { nitro: true, nuxt: true })
  }

  return compatibility
}

import type { Nuxt } from '@nuxt/schema'
import { addTypeTemplate, getNuxtVersion, useNuxt } from '@nuxt/kit'

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
  routeConfig?: string
  routeRules?: string
  runtimeHooks?: string
}

const NITRO_RUNTIME_MODULE = '#nuxtseo/nitro'
const H3_RUNTIME_MODULE = '#nuxtseo/h3'
const TYPE_TEMPLATE_FILENAME = 'types/nuxtseo-nitro.d.ts'
const setupMarker = Symbol.for('nuxtseo:nitro-runtime-compatibility')
const runtimeSetupMarker = Symbol.for('nuxtseo:nitro-runtime-compatibility:request-context')

interface NuxtNitroCompatibilityOptions {
  alias?: Record<string, string>
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
  useStorage,
  defineTask,
  runTask,
} from 'nitropack/runtime'
`

const nitroV3Runtime = `export { definePlugin as defineNitroPlugin } from 'nitro'
export { useNitroApp } from 'nitro/app'
export { useRequest as useEvent } from 'nitro/context'
export { useRuntimeConfig } from 'nitro/runtime-config'
export { defineCachedFunction } from 'nitro/cache'
export { useStorage } from 'nitro/storage'
export { defineTask, runTask } from 'nitro/task'
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
  const nitroRuntime = compatibility._tag === 'nitro-v3' ? nitroV3Runtime : nitroV2Runtime
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

function applyNitroRuntimeCompatibility(nuxt: Nuxt, compatibility: NitroRuntimeCompatibility): void {
  const nuxtOptions = nuxt.options as Nuxt['options'] & { nitro?: NuxtNitroCompatibilityOptions }
  const nitroOptions = nuxtOptions.nitro ||= {}
  nitroOptions.alias ||= {}
  nitroOptions.virtual ||= {}
  nitroOptions.alias[H3_RUNTIME_MODULE] = compatibility._tag === 'nitro-v3' ? 'nitro/h3' : 'h3'
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
  ].filter((value): value is string => Boolean(value))

  const declarations: string[] = []
  if (nitroInterfaces.length) {
    declarations.push(`declare module '${compatibility.nitroTypesModule}' {\n${nitroInterfaces.join('\n')}\n}`)
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

  const nuxtWithRuntimeMarker = nuxt as Nuxt & { [runtimeSetupMarker]?: true }
  if (!nuxtWithRuntimeMarker[runtimeSetupMarker]) {
    nuxtWithRuntimeMarker[runtimeSetupMarker] = true
    nuxt.hooks.hookOnce('modules:done', () => applyNitroRuntimeCompatibility(nuxt, compatibility))
  }

  const nuxtWithMarker = nuxt as Nuxt & { [setupMarker]?: true }
  if (!nuxtWithMarker[setupMarker]) {
    nuxtWithMarker[setupMarker] = true
    addTypeTemplate({
      filename: TYPE_TEMPLATE_FILENAME,
      getContents: async () => renderRuntimeDeclarations(compatibility),
    }, { nitro: true, nuxt: true })
  }

  return compatibility
}

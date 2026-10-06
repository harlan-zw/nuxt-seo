import type { Nuxt } from 'nuxt/schema'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { useNuxt } from '@nuxt/kit'

export type RuntimeAliasOptions = { namespace: `#${string}` } & (
  | { app: string, server?: string }
  | { app?: string, server: string }
)

/** Register curated directory entry points with separate app and server types. */
export function setupRuntimeAliases(options: RuntimeAliasOptions, nuxt: Nuxt = useNuxt()): void {
  const entries = [
    { runtime: 'app' as const, directory: options.app },
    { runtime: 'server' as const, directory: options.server },
  ].filter((entry): entry is { runtime: 'app' | 'server', directory: string } => entry.directory !== undefined)

  for (const { runtime, directory } of entries) {
    if (!isAbsolute(directory))
      throw new Error(`Runtime alias ${options.namespace}/${runtime} requires an absolute directory.`)
    const alias = `${options.namespace}/${runtime}`
    // Nuxt 4's app type context can include server files. Native aliases type both contexts.
    nuxt.options.alias[alias] = directory
    if (runtime === 'server') {
      const options = nuxt.options as Nuxt['options'] & { nitro?: { alias?: Record<string, string> } }
      const nitro = options.nitro ||= {}
      nitro.alias ||= {}
      nitro.alias[alias] = directory
    }
  }

  nuxt.hook('prepare:types', ({ tsConfig, serverTsConfig }) => {
    const typesDir = nuxt.options.typesDir || nuxt.options.buildDir
    for (const { runtime, directory } of entries) {
      const alias = `${options.namespace}/${runtime}`
      const config = runtime === 'app' ? tsConfig : serverTsConfig
      config.compilerOptions ||= {}
      config.compilerOptions.paths ||= {}
      const base = resolve(typesDir, config.compilerOptions.baseUrl || '.')
      const path = relative(base, directory).split(sep).join('/')
      const prefix = path.startsWith('.') ? path : `./${path}`
      config.compilerOptions.paths[alias] = [join(prefix, 'index').split(sep).join('/')]
      config.compilerOptions.paths[`${alias}/*`] = [`${prefix}/*`]
    }
  })
}

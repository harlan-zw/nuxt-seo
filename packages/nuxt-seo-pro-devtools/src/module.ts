import { createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Your Nuxt SEO Pro API key (nsp_* format).
   * Also reads from NUXT_SEO_PRO_KEY env var or runtimeConfig.seoProKey.
   */
  proKey?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-pro-devtools',
    configKey: 'seoProDevtools',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  defaults: {},
  async setup(options, nuxt) {
    const logger = useLogger('nuxt-seo-pro-devtools')
    const resolver = createResolver(import.meta.url)

    // Resolve the API key from options, runtimeConfig, or env
    const proKey = options.proKey
      || nuxt.options.runtimeConfig.seoProKey as string
      || process.env.NUXT_SEO_PRO_KEY

    if (!proKey) {
      logger.warn('No Pro API key configured. Set NUXT_SEO_PRO_KEY env var or seoProDevtools.proKey in nuxt.config.')
      return
    }

    // Store proKey in private runtimeConfig (server-only, never exposed to client)
    nuxt.options.runtimeConfig.seoProKey = proKey

    // Register with telemetry so Pro dashboard knows the devtools module is installed
    nuxt.hooks.hook('nuxt-seo-pro:modules' as any, (modules: Array<{ name: string, version?: string }>) => {
      modules.push({ name: 'nuxt-seo-pro-devtools', version: '0.1.0' })
    })

    // Only register devtools in dev mode
    if (!nuxt.options.dev)
      return

    const { setupDevToolsUI } = await import('./build/devtools')
    setupDevToolsUI(resolver.resolve, nuxt)
  },
})

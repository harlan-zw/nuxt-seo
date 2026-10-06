import type { Nuxt } from '@nuxt/schema'
import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import { addServerHandler, addServerPlugin, addServerTemplate, createResolver } from '@nuxt/kit'
import { modules } from 'nuxtseo-shared/const'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const CONFIG_KEYS: Partial<Record<NuxtSEOModule['slug'], string>> = {
  'site-config': 'site',
  'robots': 'robots',
  'sitemap': 'sitemap',
  'og-image': 'ogImage',
  'schema-org': 'schemaOrg',
  'seo-utils': 'seo',
  'link-checker': 'linkChecker',
  'ai-ready': 'aiReady',
  'skew-protection': 'skewProtection',
}

export function setupDevelopmentChecks(nuxt: Nuxt): void {
  if (!nuxt.options.dev)
    return

  const resolve = createResolver(import.meta.url).resolve
  // Runtime files import Nitro virtual modules and must be bundled, including packed installs.
  nuxt.options.nitro.externals ||= {}
  nuxt.options.nitro.externals.inline ||= []
  nuxt.options.nitro.externals.inline.push(resolve('./runtime'))
  const context = {
    ssr: nuxt.options.ssr !== false,
    hasI18n: false,
    hasDynamicRoutes: false,
    hasContent: false,
    isPrerendered: nuxt.options.nitro.static === true || nuxt.options.nitro.preset === 'static',
    moduleOptions: {} as Partial<Record<NuxtSEOModule['slug'], Record<string, unknown>>>,
  }
  nuxt.hook('pages:extend', (pages) => {
    const hasDynamic = (items: typeof pages): boolean => items.some(page => page.path.includes(':') || hasDynamic(page.children || []))
    context.hasDynamicRoutes = hasDynamic(pages)
  })

  nuxt.hook('modules:done', () => {
    const installedModuleSlugs: NuxtSEOModule['slug'][] = []
    const disabledModuleSlugs: NuxtSEOModule['slug'][] = []
    for (const module of modules) {
      if (module.slug === 'nuxt-seo')
        continue
      const installed = nuxt.options._installedModules.find(item => item.meta?.name === module.npm)
      const configKey = CONFIG_KEYS[module.slug]
      const config = configKey ? (nuxt.options as unknown as Record<string, unknown>)[configKey] : undefined
      const disabled = config === false || (typeof config === 'object' && config !== null && 'enabled' in config && config.enabled === false) || installed?.meta?.disabled
      if (typeof config === 'object' && config !== null) {
        const fields = module.slug === 'sitemap' ? ['enabled', 'zeroRuntime', 'zeroPrerender'] : ['enabled']
        context.moduleOptions[module.slug] = Object.fromEntries(fields.filter(field => field in config).map(field => [field, (config as Record<string, unknown>)[field]]))
      }
      if (disabled)
        disabledModuleSlugs.push(module.slug)
      else if (installed)
        installedModuleSlugs.push(module.slug)
    }
    const i18n = (nuxt.options as unknown as Record<string, unknown>).i18n as { locales?: (string | { code?: string })[], strategy?: string } | undefined
    context.hasI18n = Array.isArray(i18n?.locales) && i18n.locales.length > 0
    const homepagePaths = [nuxt.options.app.baseURL]
    if (context.hasI18n && i18n?.strategy !== 'no_prefix') {
      const base = nuxt.options.app.baseURL.replace(/\/$/, '')
      for (const locale of i18n?.locales || []) {
        const code = typeof locale === 'string' ? locale : locale.code
        if (code && /^[\w-]+$/.test(code))
          homepagePaths.push(`${base}/${code}`)
      }
    }
    context.hasContent = nuxt.options._installedModules.some(item => item.meta?.name === '@nuxt/content' || item.meta?.name === '@harlan-zw/comark-content')
    setupNitroRuntimeCompatibility(nuxt)
    addServerTemplate({
      filename: '#nuxt-seo/setup.mjs',
      getContents: () => `export default ${JSON.stringify({ installedModuleSlugs, disabledModuleSlugs, baseURL: nuxt.options.app.baseURL, homepagePaths, context })}`,
    })
    addServerPlugin(resolve('./runtime/server/plugins/setup'))
    addServerHandler({ route: '/__nuxt-seo__/setup.json', handler: resolve('./runtime/server/routes/setup.json') })
  })
}

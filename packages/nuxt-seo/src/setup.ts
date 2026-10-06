import type { Nuxt } from '@nuxt/schema'
import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import { addServerHandler, addServerPlugin, addServerTemplate, createResolver, getNuxtVersion } from '@nuxt/kit'
import { getSetupTipOptOuts, parseSetupChecklistContext } from 'nuxtseo-shared/checklist'
import { modules } from 'nuxtseo-shared/const'
import { resolveNitroPreset, setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

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

function optionRecord(value: unknown): Record<string, unknown> | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    return
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null ? value as Record<string, unknown> : undefined
}

// Match Nuxt's inline priority for nested user choices, without adding module defaults.
function mergeUserChoices(config: unknown, inline: unknown): Record<string, unknown> {
  const base = optionRecord(config) || {}
  const overrides = optionRecord(inline) || {}
  return Object.fromEntries([...new Set([...Object.keys(base), ...Object.keys(overrides)])].map((key) => {
    const override = overrides[key]
    const value = override === undefined || override === null
      ? base[key]
      : optionRecord(override) && optionRecord(base[key])
        ? mergeUserChoices(base[key], override)
        : override
    return [key, value]
  }))
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
    hasPrerenderedRoutes: (nuxt.options.nitro.prerender?.routes?.length || 0) > 0,
    devtoolsEnabled: nuxt.options.devtools !== false && nuxt.options.devtools?.enabled === true,
    nuxtMajor: Number.parseInt(getNuxtVersion(nuxt), 10),
    nitroPreset: resolveNitroPreset(nuxt.options.nitro),
    sitemapPrerendered: nuxt.options.nitro.prerender?.routes?.some(route => typeof route === 'string' && (route.endsWith('/sitemap.xml') || route === '/sitemap_index.xml')) === true,
    hasSitemapOutputHook: typeof (nuxt.options.nitro.hooks as Record<string, unknown> | undefined)?.['sitemap:output'] !== 'undefined',
    moduleOptions: {} as Partial<Record<NuxtSEOModule['slug'], Record<string, unknown>>>,
    optOuts: {} as Partial<Record<NuxtSEOModule['slug'], string[]>>,
  }
  nuxt.hook('pages:extend', (pages) => {
    const hasDynamic = (items: typeof pages): boolean => items.some(page => page.path.includes(':') || hasDynamic(page.children || []))
    context.hasDynamicRoutes = hasDynamic(pages)
  })

  nuxt.hook('modules:done', async () => {
    const devtools = nuxt.options._installedModules.find(item => item.meta?.name === '@nuxt/devtools')
    context.devtoolsEnabled = !!devtools && !devtools.meta.disabled && nuxt.options.devtools !== false && nuxt.options.devtools?.enabled !== false
    const routeRules = nuxt.options.routeRules || {}
    const nitroRouteRules = nuxt.options.nitro.routeRules || {}
    const prerendered = (path: string) => (nitroRouteRules[path]?.prerender ?? routeRules[path]?.prerender) === true
    context.hasPrerenderedRoutes = (nuxt.options.nitro.prerender?.routes?.length || 0) > 0
      || [...new Set([...Object.keys(routeRules), ...Object.keys(nitroRouteRules)])].some(prerendered)
    context.sitemapPrerendered = nuxt.options.nitro.prerender?.routes?.some(route => typeof route === 'string' && (route.endsWith('/sitemap.xml') || route === '/sitemap_index.xml')) === true
      || prerendered('/sitemap.xml') || prerendered('/sitemap_index.xml')
    const installedModuleSlugs: NuxtSEOModule['slug'][] = []
    const disabledModuleSlugs: NuxtSEOModule['slug'][] = []
    for (const module of modules) {
      if (module.slug === 'nuxt-seo')
        continue
      const installed = nuxt.options._installedModules.find(item => item.meta?.name === module.npm)
      const configKey = CONFIG_KEYS[module.slug]
      const config = configKey ? (nuxt.options as unknown as Record<string, unknown>)[configKey] : undefined
      const inline = nuxt.options.modules?.find(entry => Array.isArray(entry) && (entry[0] === installed?.module || entry[0] === module.npm))
      const inlineOptions = Array.isArray(inline) ? inline[1] : undefined
      // Nuxt's public getter applies module defaults and inline options without rerunning setup.
      const resolved = config === false || installed?.meta?.disabled ? config : await installed?.module?.getOptions?.(inlineOptions || {}, nuxt) || config
      const disabled = config === false || (typeof resolved === 'object' && resolved !== null && 'enabled' in resolved && resolved.enabled === false) || installed?.meta?.disabled
      if (typeof resolved === 'object' && resolved !== null) {
        context.moduleOptions[module.slug] = resolved as Record<string, unknown>
        const requested = mergeUserChoices(config, inlineOptions)
        context.optOuts[module.slug] = getSetupTipOptOuts(module.slug, requested)
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
      getContents: () => `export default ${JSON.stringify({ installedModuleSlugs, disabledModuleSlugs, baseURL: nuxt.options.app.baseURL, homepagePaths, context: parseSetupChecklistContext(context) })}`,
    })
    addServerPlugin(resolve('./runtime/server/plugins/setup'))
    addServerHandler({ route: '/__nuxt-seo__/setup.json', handler: resolve('./runtime/server/routes/setup.json') })
  })
}

import type { ChecklistItemResult, SetupChecklistContext, SetupChecklistInput } from './checklist'
import type { NuxtSEOModule } from './const'

// This is also the metadata allowlist. Never publish source, storage, or database credentials.
const OPTION_PATHS: Partial<Record<NuxtSEOModule['slug'], string[]>> = {
  'site-config': ['enabled'],
  'robots': ['enabled'],
  'schema-org': ['enabled'],
  'skew-protection': ['enabled'],
  'sitemap': ['enabled', 'zeroRuntime', 'zeroPrerender', 'minify', 'experimentalStreaming'],
  'og-image': ['enabled', 'zeroRuntime', 'buildCache'],
  'seo-utils': ['enabled', 'minify', 'minify.build', 'minify.runtime'],
  'ai-ready': ['enabled', 'contentNegotiation', 'llmsTxt.markdownLinks', 'runtimeSync', 'cron', 'database.type'],
  'link-checker': ['enabled', 'showLiveInspections', 'runOnBuild', 'failOnError'],
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined
}

function pathValue(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => record(current)?.[key], value)
}

/** Preserve explicit opt-outs separately from module defaults. */
export function getSetupTipOptOuts(slug: NuxtSEOModule['slug'], options: unknown): string[] {
  return (OPTION_PATHS[slug] || []).filter(path => path.split('.').some((_, index, keys) => pathValue(options, keys.slice(0, index + 1).join('.')) === false))
}

/** Parse safe configuration facts at the metadata boundary, preserving unknown values as unknown. */
export function parseSetupChecklistContext(value: unknown): SetupChecklistContext | undefined {
  const data = record(value)
  if (!data || !['ssr', 'hasI18n', 'hasDynamicRoutes', 'hasContent'].every(key => typeof data[key] === 'boolean'))
    return
  const context: SetupChecklistContext = {
    ssr: data.ssr as boolean,
    hasI18n: data.hasI18n as boolean,
    hasDynamicRoutes: data.hasDynamicRoutes as boolean,
    hasContent: data.hasContent as boolean,
    moduleOptions: {},
    optOuts: {},
  }
  for (const key of ['isPrerendered', 'hasPrerenderedRoutes', 'devtoolsEnabled', 'sitemapPrerendered', 'hasSitemapOutputHook'] as const) {
    if (typeof data[key] === 'boolean')
      context[key] = data[key]
  }
  if (typeof data.nuxtMajor === 'number' && Number.isInteger(data.nuxtMajor) && data.nuxtMajor > 0)
    context.nuxtMajor = data.nuxtMajor
  if (typeof data.nitroPreset === 'string' && /^[\w-]+$/.test(data.nitroPreset))
    context.nitroPreset = data.nitroPreset
  for (const [slug, paths] of Object.entries(OPTION_PATHS)) {
    const options = record(record(data.moduleOptions)?.[slug])
    const selected: Record<string, unknown> = {}
    let valid = true
    for (const path of paths) {
      let option = pathValue(options, path)
      if (option === undefined)
        continue
      if (path === 'minify' && record(option))
        continue
      // Both options accept an enabled configuration object. Keep only their effective switch.
      if ((path === 'buildCache' || path === 'runtimeSync') && record(option))
        option = true
      const validOption = path === 'database.type'
        ? typeof option === 'string' && ['none', 'sqlite', 'bun', 'd1', 'libsql', 'neon', 'postgres'].includes(option)
        : typeof option === 'boolean'
      if (!validOption) {
        valid = false
        break
      }
      const [key, child] = path.split('.')
      if (child) {
        if (!record(selected[key!]))
          selected[key!] = {}
        ;(selected[key!] as Record<string, unknown>)[child] = option
      }
      else {
        selected[key!] = option
      }
    }
    if (valid && Object.keys(selected).length)
      context.moduleOptions![slug as NuxtSEOModule['slug']] = selected
    const optOuts = record(data.optOuts)?.[slug]
    if (Array.isArray(optOuts))
      context.optOuts![slug as NuxtSEOModule['slug']] = optOuts.filter((path): path is string => typeof path === 'string' && paths.includes(path))
  }
  return context
}

function sourceUrls(data: Record<string, any> | undefined): Set<string> | undefined {
  if (!Array.isArray(data?.globalSources) || !record(data?.sitemaps))
    return
  const sources = [...data.globalSources, ...Object.values(data.sitemaps).flatMap((sitemap: any) => Array.isArray(sitemap?.sources) ? sitemap.sources : [])]
  const urls = new Set<string>()
  for (const source of sources) {
    if (!record(source) || source.error || source._isFailure || !Array.isArray(source.urls))
      return
    for (const url of source.urls) {
      const loc = typeof url === 'string' ? url : record(url)?.loc
      if (typeof loc === 'string' && (loc.startsWith('/') || URL.canParse(loc)))
        urls.add(loc)
    }
  }
  return urls
}

/** Optional tips require positive app evidence. Absence is never an optimization deficit. */
export function evaluateSetupTips(slug: NuxtSEOModule['slug'], input: SetupChecklistInput): ChecklistItemResult[] {
  const context = input.context
  if (!context || input.disabledModuleSlugs?.has(slug))
    return []
  const options = context.moduleOptions?.[slug]
  if (!options || options.enabled === false)
    return []
  const tips: ChecklistItemResult[] = []
  const add = (path: string, id: string, label: string, detail: string, action: string, description: string, docs: string) => {
    if (context.optOuts?.[slug]?.includes(path))
      return
    tips.push({ id, label, detail, action, description, docsUrl: `https://nuxtseo.com/docs/${docs}`, level: 'recommended', status: 'failed', passed: false })
  }
  const staticApp = context.ssr && context.isPrerendered === true && !context.hasDynamicRoutes
  const runtimeApp = context.ssr && context.isPrerendered === false
  if (slug === 'sitemap') {
    const data = input.debugData.get(slug)
    const urls = sourceUrls(data)
    const sources = [...(data?.globalSources || []), ...Object.values(data?.sitemaps || {}).flatMap((sitemap: any) => sitemap.sources || [])]
    const hasRuntimeSources = sources.some(source => source.sourceType === 'user' || (typeof source.context?.name === 'string' && !source.context.name.startsWith('nuxt:')))
    if (staticApp && options.zeroRuntime === false && options.zeroPrerender !== true && urls && !hasRuntimeSources)
      add('zeroRuntime', 'zero-runtime', 'Prerender sitemaps without runtime handlers', 'Your app uses static generation and only app URL sources.', 'Consider sitemap: { zeroRuntime: true } if all sitemap URLs are known at build time.', 'This removes sitemap runtime code. Sitemap URLs then update only during builds.', 'sitemap/guides/zero-runtime')
    // Counts are distinct source candidates, before final sitemap filtering. These thresholds limit noisy tips.
    if (urls && urls.size >= 1000 && options.minify === false)
      add('minify', 'sitemap-minify', 'Minify large sitemaps', `Your sitemap sources contain ${urls.size} distinct URL candidates.`, 'Consider sitemap: { minify: true }.', 'Minification reduces XML bytes. Raw XML becomes harder to inspect.', 'sitemap/api/config#minify-boolean')
    if (urls && urls.size >= 10000 && runtimeApp && context.nuxtMajor !== undefined && context.nuxtMajor < 5 && context.nitroPreset === 'node-server' && context.sitemapPrerendered === false && context.hasSitemapOutputHook === false && options.zeroRuntime !== true && options.experimentalStreaming === false)
      add('experimentalStreaming', 'sitemap-streaming', 'Stream large runtime sitemaps', `Your Node sitemap sources contain ${urls.size} distinct URL candidates.`, 'Consider sitemap: { experimentalStreaming: true }.', 'Streaming reduces XML serialization memory. Sources still resolve in memory. This feature is experimental.', 'sitemap/advanced/performance')
  }
  if (slug === 'og-image') {
    const data = input.debugData.get(slug)
    const hasAppTemplate = Array.isArray(data?.componentNames) && data.componentNames.some((component: any) => component?.category === 'app')
    if (staticApp && hasAppTemplate && options.zeroRuntime !== true)
      add('zeroRuntime', 'og-zero-runtime', 'Prerender OG images without runtime rendering', 'Your static app has a custom OG Image template.', 'Consider ogImage: { zeroRuntime: true } if every OG image page is prerendered.', 'This removes runtime renderer code. Pages without prerendering receive no generated OG image.', 'og-image/guides/zero-runtime')
    if (context.ssr && (staticApp || context.hasPrerenderedRoutes === true) && hasAppTemplate && options.buildCache === false)
      add('buildCache', 'og-build-cache', 'Reuse OG images between builds', 'Your app prerenders pages and has a custom OG Image template.', 'Consider ogImage: { buildCache: true }.', 'The cache reuses unchanged images. Persist its directory in CI to reuse images between jobs.', 'og-image/guides/build-cache')
  }
  if (slug === 'seo-utils' && runtimeApp && context.hasDynamicRoutes && record(options.minify)?.runtime === false && record(options.minify)?.build !== false)
    add('minify.runtime', 'runtime-minify', 'Minify runtime inline scripts and styles', 'Your app serves dynamic pages through SSR.', 'For runtime inline scripts or styles, consider seo: { minify: { build: true, runtime: true } }.', 'Runtime minification reduces inline response bytes. It adds processing to each response.', 'seo-utils/api/config#minify-boolean--build-boolean-runtime-boolean')
  if (slug === 'link-checker') {
    if (context.devtoolsEnabled === true && options.showLiveInspections === false)
      add('showLiveInspections', 'live-inspections', 'Inspect links while browsing', 'Nuxt DevTools is enabled in your app.', 'Consider linkChecker: { showLiveInspections: true }.', 'Live inspections show link results while browsing. They add development checks and overlays.', 'link-checker/guides/live-inspections')
    if (context.ssr && (context.isPrerendered === true || context.hasPrerenderedRoutes === true) && options.runOnBuild === true && options.failOnError === false)
      add('failOnError', 'fail-on-link-errors', 'Stop builds on broken prerendered links', 'Your app scans prerendered pages during builds.', 'Consider linkChecker: { failOnError: true }.', 'Scanned link errors then stop builds. Existing link errors can block deployment.', 'link-checker/guides/build-scans')
  }
  if (slug === 'ai-ready') {
    if (runtimeApp && options.contentNegotiation === false && record(options.llmsTxt)?.markdownLinks !== true)
      add('llmsTxt.markdownLinks', 'markdown-links', 'Link directly to Markdown pages', 'Your app disables AI content negotiation.', 'Consider aiReady: { llmsTxt: { markdownLinks: true } }.', 'Agents can follow direct Markdown links. Generated links then point to Markdown instead of HTML.', 'ai-ready/guides/llms-txt')
    if (runtimeApp && (context.hasDynamicRoutes || context.hasContent) && options.runtimeSync !== true && options.cron !== true && ['d1', 'libsql', 'neon', 'postgres'].includes(String(record(options.database)?.type)))
      add('runtimeSync', 'runtime-sync', 'Discover new sitemap pages between builds', 'Your server app has dynamic content and a persistent database type.', 'If new pages appear between deployments, consider aiReady: { runtimeSync: true }.', 'Sync fetches new pages in the background. Configure database access and polling. Existing pages need reindexing.', 'ai-ready/guides/runtime-indexing')
  }
  return tips
}

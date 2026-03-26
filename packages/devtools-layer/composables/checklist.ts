import type { ChecklistItemDefinition, NuxtSEOModule } from 'nuxtseo-shared/const'
import { computed, ref, toValue } from 'vue'
import { installedModules } from './modules'
import { appFetch } from './rpc'

export interface ChecklistDetectResult {
  passed: boolean
  detail?: string
}

interface ChecklistItemWithDetect extends ChecklistItemDefinition {
  detect: (data: Record<string, any>, ctx: DetectContext) => ChecklistDetectResult
}

interface DetectContext {
  installedModuleSlugs: Set<string>
  debugData: Map<string, Record<string, any>>
}

export interface ChecklistItemResult extends ChecklistItemDefinition {
  passed: boolean
  detail?: string
}

export interface ModuleChecklistResult {
  moduleSlug: NuxtSEOModule['slug']
  moduleLabel: string
  moduleIcon: string
  items: ChecklistItemResult[]
  requiredPending: number
  recommendedPending: number
  totalPending: number
}

export interface ChecklistSummary {
  total: number
  passed: number
  requiredPending: number
  recommendedPending: number
}

// Debug endpoint paths for each module
const DEBUG_ENDPOINTS: Partial<Record<NuxtSEOModule['slug'], string>> = {
  'site-config': '/__site-config__/debug',
  'robots': '/__robots__/debug.json',
  'sitemap': '/__sitemap__/debug.json',
  'og-image': '/__nuxt-og-image/debug.json',
  'schema-org': '/__schema-org__/debug.json',
}

// Module slug used internally by devtools → catalog slug mapping
const DEVTOOLS_NAME_TO_SLUG: Record<string, NuxtSEOModule['slug']> = {
  'nuxt-robots': 'robots',
  'sitemap': 'sitemap',
  'nuxt-og-image': 'og-image',
  'nuxt-schema-org': 'schema-org',
  'nuxt-seo-utils': 'seo-utils',
  'nuxt-link-checker': 'link-checker',
  'nuxt-site-config': 'site-config',
  'nuxt-ai-ready': 'ai-ready',
  'nuxt-skew-protection': 'skew-protection',
}

const MODULE_META: Record<string, { label: string, icon: string }> = {
  'site-config': { label: 'Site Config', icon: 'carbon:settings-check' },
  'robots': { label: 'Robots', icon: 'carbon:bot' },
  'sitemap': { label: 'Sitemap', icon: 'carbon:load-balancer-application' },
  'og-image': { label: 'OG Image', icon: 'carbon:image-search' },
  'seo-utils': { label: 'SEO Utils', icon: 'carbon:tools' },
  'schema-org': { label: 'Schema.org', icon: 'carbon:chart-relationship' },
}

function isValidUrl(url?: string): boolean {
  if (!url)
    return false
  return !url.includes('localhost') && !url.includes('127.0.0.1') && url.length > 0
}

// Checklist definitions with detection logic per module
const CHECKLIST_DEFINITIONS: Partial<Record<NuxtSEOModule['slug'], ChecklistItemWithDetect[]>> = {
  'site-config': [
    {
      id: 'site-url',
      label: 'Site URL configured',
      description: 'A production site URL is needed for canonical URLs, sitemaps, and OG images to work correctly.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/site-config/getting-started/how-it-works',
      detect: (data) => {
        const url = data?.config?.url || ''
        const passed = isValidUrl(url)
        return { passed, detail: passed ? url : 'Not set or using localhost' }
      },
    },
    {
      id: 'site-name',
      label: 'Site name set',
      description: 'Used for default meta tags, Schema.org, and OG tags across all modules.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/site-config/getting-started/how-it-works',
      detect: (data) => {
        const name = data?.config?.name || ''
        const passed = !!name && name !== 'My Site'
        return { passed, detail: passed ? name : 'Not configured' }
      },
    },
    {
      id: 'default-locale',
      label: 'Default locale configured',
      description: 'Ensures correct hreflang tags and locale-aware sitemaps when using i18n.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/site-config/guides/setting-site-config',
      detect: (data) => {
        const locale = data?.config?.defaultLocale
        const passed = !!locale
        return { passed, detail: passed ? locale : 'Not set' }
      },
    },
    {
      id: 'trailing-slash',
      label: 'Trailing slash preference set',
      description: 'Prevents duplicate content from inconsistent URL formats. Set explicitly to true or false.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/site-config/guides/setting-site-config',
      detect: (data) => {
        const trailingSlash = data?.config?.trailingSlash
        const passed = typeof trailingSlash === 'boolean'
        return { passed, detail: passed ? (trailingSlash ? 'Enabled' : 'Disabled') : 'Not explicitly set' }
      },
    },
    {
      id: 'robots-installed',
      label: 'Robots module installed',
      description: 'Controls crawling and indexing across all SEO modules. Strongly recommended.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/robots/getting-started/installation',
      detect: (_data, ctx) => {
        const passed = ctx.installedModuleSlugs.has('robots')
        return { passed, detail: passed ? 'Installed' : 'Not installed' }
      },
    },
  ],
  'robots': [
    {
      id: 'no-validation-errors',
      label: 'No robots.txt validation errors',
      description: 'Your robots.txt should be free of syntax errors that could confuse crawlers.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/robots/getting-started/installation',
      detect: (data) => {
        const errors = data?.validation?.errors || []
        const passed = errors.length === 0
        return { passed, detail: passed ? 'No errors' : `${errors.length} error(s) found` }
      },
    },
    {
      id: 'ai-directives',
      label: 'AI bot directives configured',
      description: 'Configure how AI crawlers interact with your content using blockAiBots or content signal directives.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/robots/guides/ai-bots',
      detect: (data) => {
        const groups = data?.runtimeConfig?.groups || []
        const hasContentSignal = groups.some((g: any) => g.contentSignal?.length || g.contentUsage?.length)
        const aiAgents = ['gptbot', 'chatgpt-user', 'anthropic-ai', 'claudebot', 'claude-web', 'google-extended', 'ccbot']
        const hasAiAgent = groups.some((g: any) =>
          (g.userAgent || []).some((ua: string) => aiAgents.includes(ua.toLowerCase())),
        )
        const passed = hasContentSignal || hasAiAgent
        return { passed, detail: passed ? (hasContentSignal ? 'Content signals configured' : 'AI agent rules configured') : 'No AI bot directives found' }
      },
    },
    {
      id: 'bot-detection',
      label: 'Bot detection enabled',
      description: 'Classify bots via headers and fingerprinting to reduce server load from non-SEO crawlers.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/robots/guides/bot-detection',
      detect: (data) => {
        const enabled = data?.runtimeConfig?.botDetection
        return { passed: !!enabled, detail: enabled ? 'Enabled' : 'Disabled' }
      },
    },
    {
      id: 'sitemap-reference',
      label: 'Sitemap referenced in robots.txt',
      description: 'Crawlers use the Sitemap directive in robots.txt to discover your sitemap URL.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/robots/guides/robots-txt',
      detect: (data) => {
        const sitemaps = data?.validation?.sitemaps || []
        const passed = sitemaps.length > 0
        return { passed, detail: passed ? `${sitemaps.length} sitemap(s) referenced` : 'No sitemap directive found' }
      },
    },
  ],
  'sitemap': [
    {
      id: 'site-url-set',
      label: 'Site URL set for sitemaps',
      description: 'Sitemaps require an absolute site URL. Without it, URLs will use localhost in production.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/getting-started/installation',
      detect: (data) => {
        const url = data?.siteConfig?.url || ''
        const passed = isValidUrl(url)
        return { passed, detail: passed ? url : 'Site URL not configured' }
      },
    },
    {
      id: 'has-sources',
      label: 'URL sources configured',
      description: 'Add dynamic URL sources for CMS or database content so all pages appear in your sitemap.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/guides/dynamic-urls',
      detect: (data) => {
        const sources = data?.globalSources || []
        const sitemaps = data?.sitemaps || {}
        const userSources = sources.filter((s: any) => s.sourceType === 'user' || (s.context?.name && !s.context.name.startsWith('nuxt:')))
        const sitemapUserSources = Object.values(sitemaps).flatMap((s: any) =>
          (s.sources || []).filter((src: any) => src.sourceType === 'user'),
        )
        const totalUser = userSources.length + sitemapUserSources.length
        const passed = totalUser > 0
        return { passed, detail: passed ? `${totalUser} custom source(s)` : 'Only default app sources detected' }
      },
    },
    {
      id: 'no-source-errors',
      label: 'No sitemap source errors',
      description: 'All configured sitemap sources should resolve successfully.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/guides/dynamic-urls',
      detect: (data) => {
        const sources = data?.globalSources || []
        const sitemaps = data?.sitemaps || {}
        const allSources = [
          ...sources,
          ...Object.values(sitemaps).flatMap((s: any) => s.sources || []),
        ]
        const failures = allSources.filter((s: any) => s._isFailure || s.error)
        const passed = failures.length === 0
        return { passed, detail: passed ? 'All sources OK' : `${failures.length} source(s) failing` }
      },
    },
    {
      id: 'url-warnings',
      label: 'No URL validation warnings',
      description: 'URLs in your sitemap should follow best practices (no whitespace, lowercase, etc).',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/guides/best-practices',
      detect: (data) => {
        const sources = data?.globalSources || []
        const sitemaps = data?.sitemaps || {}
        const allSources = [
          ...sources,
          ...Object.values(sitemaps).flatMap((s: any) => s.sources || []),
        ]
        const warningCount = allSources.reduce((sum: number, s: any) => sum + (s._urlWarnings?.length || 0), 0)
        const passed = warningCount === 0
        return { passed, detail: passed ? 'No warnings' : `${warningCount} URL warning(s)` }
      },
    },
  ],
  'og-image': [
    {
      id: 'renderer',
      label: 'Renderer installed',
      description: 'A renderer (Takumi, Satori, or Browser) is required to generate OG images.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/og-image/getting-started/installation',
      detect: (data) => {
        const compat = data?.compatibility || {}
        const hasTakumi = compat.takumi && compat.takumi !== false
        const hasSatori = compat.satori && compat.satori !== false
        const hasBrowser = compat.browser && compat.browser !== false
        const passed = hasTakumi || hasSatori || hasBrowser
        const renderers = [hasTakumi && 'takumi', hasSatori && 'satori', hasBrowser && 'browser'].filter(Boolean)
        return { passed, detail: passed ? `Available: ${renderers.join(', ')}` : 'No renderer installed' }
      },
    },
    {
      id: 'custom-template',
      label: 'Custom OG template created',
      description: 'Community templates are for development only. Create a custom template for production.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/og-image/guides/templates',
      detect: (data) => {
        const components = data?.componentNames || []
        const appTemplates = components.filter((c: any) => c.category === 'app')
        const communityTemplates = components.filter((c: any) => c.category === 'community')
        const passed = appTemplates.length > 0
        if (passed)
          return { passed, detail: `${appTemplates.length} custom template(s)` }
        if (communityTemplates.length > 0)
          return { passed: false, detail: `${communityTemplates.length} community template(s), eject before production` }
        return { passed: false, detail: 'No templates found' }
      },
    },
  ],
  'seo-utils': [
    {
      id: 'schema-org-installed',
      label: 'Schema.org module installed',
      description: 'Adds structured data to your pages, improving rich search results. Pairs well with SEO Utils.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/schema-org/getting-started/installation',
      detect: (_data, ctx) => {
        const passed = ctx.installedModuleSlugs.has('schema-org')
        return { passed, detail: passed ? 'Installed' : 'Not installed' }
      },
    },
    {
      id: 'sitemap-installed',
      label: 'Sitemap module installed',
      description: 'Generates XML sitemaps so search engines can discover all your pages efficiently.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/getting-started/installation',
      detect: (_data, ctx) => {
        const passed = ctx.installedModuleSlugs.has('sitemap')
        return { passed, detail: passed ? 'Installed' : 'Not installed' }
      },
    },
  ],
  'schema-org': [
    {
      id: 'identity',
      label: 'Identity configured',
      description: 'Set up your Organization or Person identity for rich Schema.org knowledge graph results.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/schema-org/guides/setup-identity',
      detect: (data) => {
        const config = data?.runtimeConfig || {}
        const identity = config.identity
        if (!identity)
          return { passed: false, detail: 'No identity set' }
        const type = typeof identity === 'string' ? identity : identity['@type'] || 'Unknown'
        const name = typeof identity === 'object' ? (identity.name || '') : ''
        return { passed: true, detail: name ? `${type}: ${name}` : type }
      },
    },
    {
      id: 'robots-companion',
      label: 'Robots module installed',
      description: 'Robots module auto-excludes non-indexable paths from Schema.org output.',
      level: 'recommended',
      docsUrl: 'https://nuxtseo.com/docs/schema-org/getting-started/installation',
      detect: (_data, ctx) => {
        const passed = ctx.installedModuleSlugs.has('robots')
        return { passed, detail: passed ? 'Installed' : 'Not installed' }
      },
    },
  ],
}

const debugCache = ref<Map<string, Record<string, any>>>(new Map())
const loading = ref(false)
const evaluated = ref(false)

function getInstalledSlugs(): Set<string> {
  const slugs = new Set<string>()
  for (const mod of toValue(installedModules)) {
    const slug = DEVTOOLS_NAME_TO_SLUG[mod.name]
    if (slug)
      slugs.add(slug)
  }
  return slugs
}

async function fetchDebugData(): Promise<void> {
  const fetch = toValue(appFetch)
  if (!fetch)
    return

  const slugs = getInstalledSlugs()
  const cache = new Map<string, Record<string, any>>()

  const fetches = Object.entries(DEBUG_ENDPOINTS)
    .filter(([slug]) => slugs.has(slug))
    .map(async ([slug, endpoint]) => {
      const data = await fetch(endpoint!).catch(() => null)
      if (data)
        cache.set(slug, data)
    })

  await Promise.all(fetches)
  debugCache.value = cache
}

function evaluateModule(slug: NuxtSEOModule['slug'], ctx: DetectContext): ModuleChecklistResult | undefined {
  const definitions = CHECKLIST_DEFINITIONS[slug]
  if (!definitions?.length)
    return undefined

  const meta = MODULE_META[slug]
  if (!meta)
    return undefined

  const data = debugCache.value.get(slug) || {}
  const items: ChecklistItemResult[] = definitions.map((def) => {
    const result = def.detect(data, ctx)
    return {
      id: def.id,
      label: def.label,
      description: def.description,
      level: def.level,
      docsUrl: def.docsUrl,
      passed: result.passed,
      detail: result.detail,
    }
  })

  const requiredPending = items.filter(i => i.level === 'required' && !i.passed).length
  const recommendedPending = items.filter(i => i.level === 'recommended' && !i.passed).length

  return {
    moduleSlug: slug,
    moduleLabel: meta.label,
    moduleIcon: meta.icon,
    items,
    requiredPending,
    recommendedPending,
    totalPending: requiredPending + recommendedPending,
  }
}

const results = computed<ModuleChecklistResult[]>(() => {
  const slugs = getInstalledSlugs()
  const ctx: DetectContext = { installedModuleSlugs: slugs, debugData: debugCache.value }
  const moduleResults: ModuleChecklistResult[] = []

  // Evaluate in a consistent order
  const orderedSlugs: NuxtSEOModule['slug'][] = ['site-config', 'robots', 'sitemap', 'og-image', 'schema-org', 'seo-utils']
  for (const slug of orderedSlugs) {
    if (!slugs.has(slug) && slug !== 'site-config')
      continue
    // Site config is always evaluated (it's the foundation)
    const result = evaluateModule(slug, ctx)
    if (result)
      moduleResults.push(result)
  }

  return moduleResults
})

const summary = computed<ChecklistSummary>(() => {
  let total = 0
  let passed = 0
  let requiredPending = 0
  let recommendedPending = 0
  for (const r of results.value) {
    total += r.items.length
    passed += r.items.filter(i => i.passed).length
    requiredPending += r.requiredPending
    recommendedPending += r.recommendedPending
  }
  return { total, passed, requiredPending, recommendedPending }
})

export function getModuleResult(slug: string): ModuleChecklistResult | undefined {
  return results.value.find(r => r.moduleSlug === slug)
}

export function getModuleResultByName(devtoolsName: string): ModuleChecklistResult | undefined {
  const slug = DEVTOOLS_NAME_TO_SLUG[devtoolsName]
  if (!slug)
    return undefined
  return getModuleResult(slug)
}

export async function evaluate(): Promise<void> {
  if (loading.value)
    return
  loading.value = true
  await fetchDebugData().catch(() => {})
  evaluated.value = true
  loading.value = false
}

// eslint-disable-next-line ts/explicit-function-return-type
export function getSetupChecklist() {
  return {
    results,
    summary,
    loading,
    evaluated,
    evaluate,
    getModuleResult,
    getModuleResultByName,
  }
}

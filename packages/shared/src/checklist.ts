import type { ChecklistItemDefinition, NuxtSEOModule } from './const'
import { evaluateSetupTips } from './setup-tips'

export { getSetupTipOptOuts, parseSetupChecklistContext } from './setup-tips'

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

export type ChecklistItemStatus = 'passed' | 'failed' | 'unavailable' | 'not-applicable'
export type ModuleChecklistStatus = 'configured' | 'needs-setup' | 'disabled' | 'unavailable' | 'automatic'

export interface ChecklistItemResult extends ChecklistItemDefinition {
  status: ChecklistItemStatus
  action?: string
  passed: boolean
  detail?: string
}

export interface ModuleChecklistResult {
  status: ModuleChecklistStatus
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
  unavailable: number
}

// Debug endpoint paths for each module
export const DEBUG_ENDPOINTS: Partial<Record<NuxtSEOModule['slug'], string>> = {
  'site-config': '/__site-config__/debug.json',
  'robots': '/__robots__/debug.json',
  'sitemap': '/__sitemap__/debug.json',
  'og-image': '/_og/debug.json',
}

// Module slug used internally by devtools → catalog slug mapping.
// `satisfies` checks the literal keys; the annotation keeps the export indexable by runtime devtools module names.
export const DEVTOOLS_NAME_TO_SLUG: Record<string, NuxtSEOModule['slug']> = {
  'nuxt-robots': 'robots',
  'sitemap': 'sitemap',
  'nuxt-og-image': 'og-image',
  'nuxt-schema-org': 'schema-org',
  'nuxt-seo-utils': 'seo-utils',
  'nuxt-link-checker': 'link-checker',
  'nuxt-site-config': 'site-config',
  'nuxt-ai-ready': 'ai-ready',
  'nuxt-skew-protection': 'skew-protection',
} satisfies Record<string, NuxtSEOModule['slug']>

const MODULE_META: Record<string, { label: string, icon: string }> = {
  'site-config': { label: 'Site Config', icon: 'carbon:settings-check' },
  'robots': { label: 'Robots', icon: 'carbon:bot' },
  'sitemap': { label: 'Sitemap', icon: 'carbon:load-balancer-application' },
  'og-image': { label: 'OG Image', icon: 'carbon:image-search' },
  'seo-utils': { label: 'SEO Utils', icon: 'carbon:tools' },
  'schema-org': { label: 'Schema.org', icon: 'carbon:chart-relationship' },
}

function isValidUrl(value?: string): boolean {
  if (typeof value !== 'string')
    return false
  if (!URL.canParse(value))
    return false
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol))
    return false
  const host = url.hostname.toLowerCase()
  return host !== 'localhost' && !host.endsWith('.localhost') && host !== '[::1]' && host !== '0.0.0.0' && !host.startsWith('127.')
}

function isConfiguredUrl(config: Record<string, any> | undefined, stack?: unknown): boolean {
  if (!isValidUrl(config?.url))
    return false
  if (typeof config?._context?.url === 'string')
    return config._context.url !== 'nitro:init'
  // Site Config can retain priority -4 when a build environment value overrides it.
  if (config?._priority?.url === -4) {
    return Array.isArray(stack) && stack.some(entry => entry && typeof entry.url === 'string' && entry.url.trim() && (entry._priority ?? 0) > -4)
  }
  return true
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
        const passed = isConfiguredUrl(data?.config, data?.stack)
        return { passed, detail: passed ? url : 'Set a production site URL.' }
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
  ],
  'sitemap': [
    {
      id: 'site-url-set',
      label: 'Site URL set for sitemaps',
      description: 'Sitemaps require an absolute site URL. Without it, URLs will use localhost in production.',
      level: 'required',
      docsUrl: 'https://nuxtseo.com/docs/sitemap/getting-started/installation',
      detect: (data, ctx) => {
        const url = data?.siteConfig?.url || ''
        const passed = isConfiguredUrl(data?.siteConfig, ctx.debugData.get('site-config')?.stack)
        return { passed, detail: passed ? url : 'Site URL not configured' }
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
  ],
}

export interface SetupChecklistContext {
  tipsEnabled?: boolean
  ssr: boolean
  hasI18n: boolean
  hasDynamicRoutes: boolean
  hasContent: boolean
  isPrerendered?: boolean
  hasPrerenderedRoutes?: boolean
  devtoolsEnabled?: boolean
  nuxtMajor?: number
  nitroPreset?: string
  sitemapPrerendered?: boolean
  hasSitemapOutputHook?: boolean
  optOuts?: Partial<Record<NuxtSEOModule['slug'], string[]>>
  moduleOptions?: Partial<Record<NuxtSEOModule['slug'], Record<string, unknown>>>
}

export interface SetupChecklistInput {
  installedModuleSlugs: Set<NuxtSEOModule['slug']>
  debugData: Map<NuxtSEOModule['slug'], Record<string, any>>
  disabledModuleSlugs?: Set<NuxtSEOModule['slug']>
  context?: SetupChecklistContext
}

const AUTOMATIC_MODULES: Record<string, { label: string, icon: string }> = {
  'link-checker': { label: 'Link Checker', icon: 'carbon:find' },
  'ai-ready': { label: 'AI Ready', icon: 'carbon:bot' },
  'skew-protection': { label: 'Skew Protection', icon: 'carbon:security' },
}

const SETUP_ACTIONS: Record<string, string> = {
  'site-url': 'Set site.url to your production URL, for example https://example.com.',
  'site-url-set': 'Set site.url to your production URL, for example https://example.com.',
  'site-name': 'Set site.name to your site name.',
  'renderer': 'Install your OG Image renderer dependencies, or set ogImage: false.',
  'no-validation-errors': 'Correct the robots.txt errors shown in DevTools.',
  'no-source-errors': 'Correct the failing sitemap sources shown in DevTools.',
}

function hasEvidence(slug: string, item: ChecklistItemWithDetect, data: Record<string, any> | undefined): data is Record<string, any> {
  if (!data)
    return false
  if (slug === 'site-config')
    return !!data.config && typeof data.config === 'object'
  if (slug === 'robots') {
    return !(typeof data.robotsTxt === 'string' && /^\s*(?:<!doctype\s+html|<html\b)/i.test(data.robotsTxt))
      && Array.isArray(data.validation?.errors) && Array.isArray(data.validation?.sitemaps)
  }
  if (slug === 'sitemap') {
    if (item.id === 'site-url-set')
      return !!data.siteConfig && typeof data.siteConfig === 'object'
    return Array.isArray(data.globalSources)
      && data.globalSources.every((source: unknown) => source !== null && typeof source === 'object')
      && !!data.sitemaps && typeof data.sitemaps === 'object'
      && Object.values(data.sitemaps).every((sitemap: any) => sitemap !== null && typeof sitemap === 'object' && (!sitemap.sources || (Array.isArray(sitemap.sources) && sitemap.sources.every((source: unknown) => source !== null && typeof source === 'object'))))
  }
  if (slug === 'og-image')
    return item.id === 'renderer' ? !!data.compatibility && typeof data.compatibility === 'object' : Array.isArray(data.componentNames)
  return true
}

/** Evaluate resolved module evidence without fetching endpoints or mutating application state. */
export function evaluateSetupChecklist(input: SetupChecklistInput): ModuleChecklistResult[] {
  const orderedSlugs: NuxtSEOModule['slug'][] = ['site-config', 'robots', 'sitemap', 'og-image', 'schema-org', 'seo-utils', 'link-checker', 'ai-ready', 'skew-protection']
  const ctx: DetectContext = { installedModuleSlugs: input.installedModuleSlugs, debugData: input.debugData }
  return orderedSlugs.filter(slug => input.installedModuleSlugs.has(slug) || input.disabledModuleSlugs?.has(slug)).map((slug) => {
    const meta = MODULE_META[slug] || AUTOMATIC_MODULES[slug]!
    const data = input.debugData.get(slug)
    const disabled = input.disabledModuleSlugs?.has(slug) === true
    const items: ChecklistItemResult[] = (CHECKLIST_DEFINITIONS[slug] || []).map((def) => {
      const { detect, ...definition } = def
      if (disabled)
        return { ...definition, status: 'not-applicable', passed: false }
      if (!hasEvidence(slug, def, data))
        return { ...definition, status: 'unavailable', passed: false, detail: 'Setup could not be checked.' }
      const result = detect(data, ctx)
      return { ...definition, ...result, status: result.passed ? 'passed' : 'failed', action: SETUP_ACTIONS[def.id] }
    })
    const requiredPending = items.filter(item => item.level === 'required' && item.status === 'failed').length
    const status: ModuleChecklistStatus = disabled ? 'disabled' : requiredPending ? 'needs-setup' : items.some(item => item.status === 'unavailable') ? 'unavailable' : !items.length || items.every(item => item.status === 'not-applicable') ? 'automatic' : 'configured'
    if (status === 'configured' || status === 'automatic')
      items.push(...evaluateSetupTips(slug, input))
    const recommendedPending = items.filter(item => item.level === 'recommended' && item.status === 'failed').length
    return { moduleSlug: slug, moduleLabel: meta.label, moduleIcon: meta.icon, items, requiredPending, recommendedPending, totalPending: requiredPending + recommendedPending, status }
  })
}

/** Terminal output uses the same evidence and severity as the DevTools checklist. */
export function formatSetupReport(results: ModuleChecklistResult[], options: { showTips?: boolean } = {}): string {
  const labels: Record<ModuleChecklistStatus, string> = { 'configured': 'Configured', 'needs-setup': 'Needs setup', 'disabled': 'Disabled', 'unavailable': 'Not checked', 'automatic': 'Automatic' }
  const lines = ['Nuxt SEO setup', ...results.map(result => `  ${result.moduleLabel}: ${labels[result.status]}`)]
  if (results.some(result => result.status === 'unavailable'))
    lines.push('', 'Some module data was unavailable. Open DevTools to retry setup checks.')
  for (const [level, heading] of [['required', 'Required setup:'], ['recommended', 'Optional tips:']] as const) {
    if (level === 'recommended' && options.showTips === false)
      continue
    const candidates = results.flatMap(result => result.items.filter(item => item.status === 'failed' && item.level === level).map(item => ({ moduleLabel: result.moduleLabel, item })))
    const hasSiteUrlFailure = candidates.some(({ item }) => item.id === 'site-url')
    const eligible = candidates.filter(({ item }) => item.id !== 'site-url-set' || !hasSiteUrlFailure)
    const failures = eligible.slice(0, level === 'recommended' ? 3 : undefined)
    if (!failures.length)
      continue
    lines.push('', heading)
    for (const { moduleLabel, item } of failures)
      lines.push(`  ${moduleLabel}: ${item.label}. ${item.detail || ''}`, `    ${item.action || item.description}`, ...(item.action ? [`    ${item.description}`] : []), `    ${item.docsUrl}`)
    if (level === 'recommended' && eligible.length > failures.length)
      lines.push(`  More optional tips: ${eligible.length - failures.length}. Open DevTools to see all tips.`)
  }
  return lines.join('\n')
}

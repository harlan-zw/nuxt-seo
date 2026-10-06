import type { SetupChecklistContext, SetupChecklistInput } from '../../src/checklist'
import { describe, expect, it } from 'vitest'
import { evaluateSetupChecklist, formatSetupReport, getSetupTipOptOuts, parseSetupChecklistContext } from '../../src/checklist'

const app: SetupChecklistContext = { ssr: true, hasI18n: false, hasDynamicRoutes: false, hasContent: false, isPrerendered: false }
function tips(input: SetupChecklistInput) {
  return evaluateSetupChecklist(input).flatMap(result => result.items.filter(item => item.level === 'recommended' && item.status === 'failed'))
}

describe('config-based optimization tips', () => {
  it('offers build reuse for prerendered OG images and respects enabled caches and explicit opt-outs', () => {
    const debugData = new Map([['og-image' as const, { compatibility: { takumi: true }, componentNames: [{ category: 'app' }] }]])
    for (const [buildCache, optOuts, expected] of [[false, [], true], [true, [], false], [false, ['buildCache'], false]] as const) {
      const result = tips({ installedModuleSlugs: new Set(['og-image']), debugData, context: { ...app, isPrerendered: true, moduleOptions: { 'og-image': { buildCache, zeroRuntime: true } }, optOuts: { 'og-image': [...optOuts] } } })
      expect(result.some(item => item.id === 'og-build-cache')).toBe(expected)
    }
  })

  it('offers live link inspections only while DevTools is enabled and the user has not opted out', () => {
    for (const [devtoolsEnabled, showLiveInspections, optOuts, expected] of [[true, false, [], true], [false, false, [], false], [true, true, [], false], [true, false, ['showLiveInspections'], false]] as const) {
      const result = tips({ installedModuleSlugs: new Set(['link-checker']), debugData: new Map(), context: { ...app, devtoolsEnabled, moduleOptions: { 'link-checker': { showLiveInspections } }, optOuts: { 'link-checker': [...optOuts] } } })
      expect(result.some(item => item.id === 'live-inspections')).toBe(expected)
    }
  })

  it('keeps runtime minification out of optional tips for dynamic SSR pages', () => {
    const input: SetupChecklistInput = { installedModuleSlugs: new Set(['seo-utils']), debugData: new Map(), context: { ...app, hasDynamicRoutes: true, moduleOptions: { 'seo-utils': { minify: { build: true, runtime: false } } } } }
    const [result] = evaluateSetupChecklist(input)
    expect(result!.status).toBe('automatic')
    expect(result!.requiredPending).toBe(0)
    expect(tips(input)).toEqual([])
    expect(formatSetupReport([result!])).not.toContain('runtime: true')
    expect(tips({ ...input, context: { ...input.context!, ssr: false } })).toEqual([])
    expect(tips({ ...input, context: { ...input.context!, moduleOptions: { 'seo-utils': { minify: true } } } })).toEqual([])
  })

  it('offers direct Markdown links when AI content negotiation is disabled', () => {
    const input: SetupChecklistInput = { installedModuleSlugs: new Set(['ai-ready']), debugData: new Map(), context: { ...app, moduleOptions: { 'ai-ready': { contentNegotiation: false, llmsTxt: { markdownLinks: false } } } } }
    expect(tips(input).some(item => item.id === 'markdown-links')).toBe(true)
    expect(tips({ ...input, context: { ...input.context!, optOuts: { 'ai-ready': ['llmsTxt.markdownLinks'] } } })).toEqual([])
    expect(tips({ ...input, disabledModuleSlugs: new Set(['ai-ready']) })).toEqual([])
    expect(tips({ ...input, context: { ...app, moduleOptions: { 'ai-ready': { contentNegotiation: false } } } }).some(item => item.id === 'markdown-links')).toBe(true)
  })

  it('does not invent tips from unknown configuration or override automatic production defaults', () => {
    const result = tips({ installedModuleSlugs: new Set(['robots', 'site-config', 'schema-org', 'seo-utils', 'og-image', 'ai-ready', 'skew-protection', 'link-checker']), debugData: new Map(), context: app })
    expect(result).toEqual([])
  })

  it('parses safe configuration without exposing credentials or turning missing options into false', () => {
    const context = parseSetupChecklistContext({ ...app, moduleOptions: { 'ai-ready': { database: { type: 'postgres', url: 'secret' }, secret: 'private', runtimeSync: { ttl: 60 } }, 'og-image': { buildCache: { base: '/private/cache' } }, 'seo-utils': { enabled: true, minify: { build: true, runtime: false } } } })!
    expect(context.moduleOptions?.['ai-ready']).toEqual({ database: { type: 'postgres' }, runtimeSync: true })
    expect(context.moduleOptions?.['og-image']).toEqual({ buildCache: true })
    expect(context.moduleOptions?.['seo-utils']).toEqual({ enabled: true })
    expect(context.moduleOptions?.sitemap).toBeUndefined()
    expect(parseSetupChecklistContext({ ...app, ssr: 'yes' })).toBeUndefined()
    expect(getSetupTipOptOuts('ai-ready', { llmsTxt: false })).toContain('llmsTxt.markdownLinks')
    expect(parseSetupChecklistContext({ ...app, moduleOptions: { 'ai-ready': { runtimeSync: 'invalid', database: { type: 'postgres' } } } })?.moduleOptions?.['ai-ready']).toBeUndefined()
  })

  it('requires an active persistent database and no scheduling opt-in for AI runtime discovery', () => {
    for (const [type, runtimeSync, cron, expected] of [['postgres', false, false, true], ['none', false, false, false], ['sqlite', false, false, false], ['postgres', true, false, false], ['postgres', false, true, false]] as const) {
      const result = tips({ installedModuleSlugs: new Set(['ai-ready']), debugData: new Map(), context: { ...app, hasDynamicRoutes: true, moduleOptions: { 'ai-ready': { database: { type }, runtimeSync, cron } } } })
      expect(result.some(item => item.id === 'runtime-sync')).toBe(expected)
    }
    expect(tips({ installedModuleSlugs: new Set(['ai-ready']), debugData: new Map(), context: { ...app, hasDynamicRoutes: true, moduleOptions: { 'ai-ready': { database: { type: 'postgres' } } } } }).some(item => item.id === 'runtime-sync')).toBe(true)
  })

  it('guards large sitemap tips by source size, runtime support, hooks, and user choices', () => {
    const debugData = new Map([['sitemap' as const, { siteConfig: { url: 'https://example.com' }, globalSources: [{ urls: Array.from({ length: 10000 }, (_, index) => `https://example.com/${index}`) }], sitemaps: {} }]])
    const input: SetupChecklistInput = { installedModuleSlugs: new Set(['sitemap']), debugData, context: { ...app, nuxtMajor: 4, nitroPreset: 'node-server', sitemapPrerendered: false, hasSitemapOutputHook: false, moduleOptions: { sitemap: { minify: false, experimentalStreaming: false, zeroRuntime: false } } } }
    expect(tips(input).map(item => item.id)).toEqual(['sitemap-minify', 'sitemap-streaming'])
    for (const change of [{ nuxtMajor: 5 }, { nitroPreset: 'cloudflare-module' }, { hasSitemapOutputHook: true }, { sitemapPrerendered: true }, { isPrerendered: true }])
      expect(tips({ ...input, context: { ...input.context!, ...change } }).some(item => item.id === 'sitemap-streaming')).toBe(false)
    expect(tips({ ...input, context: { ...input.context!, optOuts: { sitemap: ['minify', 'experimentalStreaming'] } } })).toEqual([])
    expect(tips({ ...input, debugData: new Map() })).toEqual([])
  })

  it('does not suggest zero runtime for dynamic OG pages or disable required renderer checks', () => {
    const input: SetupChecklistInput = { installedModuleSlugs: new Set(['og-image']), debugData: new Map([['og-image', { compatibility: { takumi: true }, componentNames: [{ category: 'app' }] }]]), context: { ...app, isPrerendered: true, moduleOptions: { 'og-image': { zeroRuntime: false, buildCache: true } } } }
    expect(tips(input).some(item => item.id === 'og-zero-runtime')).toBe(true)
    for (const change of [{ ssr: false }, { hasDynamicRoutes: true }, { isPrerendered: false }, { optOuts: { 'og-image': ['zeroRuntime'] } }])
      expect(tips({ ...input, context: { ...input.context!, ...change } })).toEqual([])
    expect(tips({ ...input, debugData: new Map([['og-image', { compatibility: {}, componentNames: [{ category: 'app' }] }]]) })).toEqual([])
    expect(evaluateSetupChecklist({ ...input, disabledModuleSlugs: new Set(['og-image']) })[0]?.requiredPending).toBe(0)
  })

  it('offers strict link build checks only when SSR pages are scanned during prerendering', () => {
    const input: SetupChecklistInput = { installedModuleSlugs: new Set(['link-checker']), debugData: new Map(), context: { ...app, hasPrerenderedRoutes: true, moduleOptions: { 'link-checker': { runOnBuild: true, failOnError: false } } } }
    expect(tips(input).some(item => item.id === 'fail-on-link-errors')).toBe(true)
    for (const change of [{ ssr: false }, { hasPrerenderedRoutes: false }, { moduleOptions: { 'link-checker': { runOnBuild: false, failOnError: false } } }, { optOuts: { 'link-checker': ['failOnError'] } }])
      expect(tips({ ...input, context: { ...input.context!, ...change } })).toEqual([])
  })

  it('keeps the terminal concise while pointing to remaining DevTools tips', () => {
    const results = evaluateSetupChecklist({ installedModuleSlugs: new Set(['seo-utils', 'link-checker', 'ai-ready']), debugData: new Map(), context: { ...app, hasDynamicRoutes: true, hasPrerenderedRoutes: true, devtoolsEnabled: true, moduleOptions: { 'seo-utils': { minify: { build: true, runtime: false } }, 'link-checker': { showLiveInspections: false, runOnBuild: true, failOnError: false }, 'ai-ready': { contentNegotiation: false, llmsTxt: { markdownLinks: false }, runtimeSync: false, cron: false, database: { type: 'postgres' } } } } })
    expect(formatSetupReport(results)).toContain('More optional tips: 1. Open DevTools to see all tips.')
  })
})

import { describe, expect, it } from 'vitest'
import { evaluateSetupChecklist, formatSetupReport } from '../../src/checklist'

describe('setup checklist', () => {
  it('does not report missing debug data as successful validation', () => {
    const results = evaluateSetupChecklist({ installedModuleSlugs: new Set(['robots', 'sitemap']), debugData: new Map() })
    expect(results.every(result => result.status === 'unavailable')).toBe(true)
    expect(results.flatMap(result => result.items).filter(item => item.level === 'required').every(item => item.status === 'unavailable')).toBe(true)
  })

  it('rejects malformed and local production URLs', () => {
    for (const url of ['oops', 'http://localhost:3000', 'http://127.0.0.1', 'http://[::1]']) {
      const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['site-config']), debugData: new Map([['site-config', { config: { url, name: 'Example' } }]]) })
      expect(result!.items.find(item => item.id === 'site-url')!.status).toBe('failed')
    }
  })

  it('does not require custom sitemap sources for static routes', () => {
    const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['sitemap']), debugData: new Map([['sitemap', { siteConfig: { url: 'https://example.com' }, globalSources: [], sitemaps: {} }]]) })
    expect(result!.status).toBe('configured')
    expect(result!.recommendedPending).toBe(0)
  })

  it('reports disabled modules without counting missing setup', () => {
    const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['og-image']), disabledModuleSlugs: new Set(['og-image']), debugData: new Map() })
    expect(result!.status).toBe('disabled')
    expect(result!.requiredPending).toBe(0)
  })

  it('reports source failures without requiring custom sources', () => {
    const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['sitemap']), debugData: new Map([['sitemap', { siteConfig: { url: 'https://example.com' }, globalSources: [{ error: 'CMS unavailable' }], sitemaps: {} }]]) })
    expect(result!.status).toBe('needs-setup')
    expect(result!.items.find(item => item.id === 'no-source-errors')!.status).toBe('failed')
  })

  it('does not trust malformed robots validation evidence', () => {
    const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['robots']), debugData: new Map([['robots', { validation: {} }]]) })
    expect(result!.status).toBe('unavailable')
    expect(result!.requiredPending).toBe(0)
  })

  it('suggests zero runtime only for fully static apps that can prerender sitemaps', () => {
    const debugData = new Map([['sitemap' as const, { siteConfig: { url: 'https://example.com' }, globalSources: [{ sourceType: 'app', urls: ['https://example.com/'] }], sitemaps: {} }]])
    for (const [isPrerendered, hasDynamicRoutes, zeroPrerender, expected] of [[true, false, false, true], [false, false, false, false], [true, true, false, false], [true, false, true, false]] as const) {
      const [result] = evaluateSetupChecklist({ installedModuleSlugs: new Set(['sitemap']), debugData, context: { ssr: true, hasI18n: false, hasContent: false, hasDynamicRoutes, isPrerendered, moduleOptions: { sitemap: { zeroPrerender, zeroRuntime: false } } } })
      expect(result!.items.some(item => item.id === 'zero-runtime')).toBe(expected)
    }
  })

  it('shows first class automatic modules without inventing setup failures', () => {
    const results = evaluateSetupChecklist({ installedModuleSlugs: new Set(['ai-ready', 'skew-protection', 'link-checker']), debugData: new Map() })
    expect(results.map(result => result.status)).toEqual(['automatic', 'automatic', 'automatic'])
    expect(results.every(result => result.requiredPending === 0)).toBe(true)
  })

  it('separates required fixes from optional tips in terminal output', () => {
    const results = evaluateSetupChecklist({ installedModuleSlugs: new Set(['site-config']), debugData: new Map([['site-config', { config: { name: 'Example', defaultLocale: '', trailingSlash: false } }]]), context: { ssr: true, hasI18n: true, hasDynamicRoutes: false, hasContent: false } })
    const report = formatSetupReport(results)
    expect(report).toContain('Required setup:')
    expect(report).toContain('Optional tips:')
    expect(report).toContain('canonical URLs')
    expect(report).toContain('https://nuxtseo.com/docs/site-config/')
  })
})

it('does not treat an HTML fallback as robots.txt validation evidence', () => {
  const [result] = evaluateSetupChecklist({
    installedModuleSlugs: new Set(['robots']),
    debugData: new Map([['robots', { robotsTxt: '<!DOCTYPE html><html><body>Fallback</body></html>', validation: { errors: ['Unknown directive'], sitemaps: [] } }]]),
  })
  expect(result!.status).toBe('unavailable')
  expect(result!.requiredPending).toBe(0)
})

it('does not count the request origin as configured site URL', () => {
  for (const [priority, expected] of [[-4, 'failed'], [-3, 'passed'], [0, 'passed']] as const) {
    const [result] = evaluateSetupChecklist({
      installedModuleSlugs: new Set(['site-config']),
      debugData: new Map([['site-config', { config: { url: 'https://preview.example.com', name: 'Example', _priority: { url: priority } } }]]),
    })
    expect(result!.items.find(item => item.id === 'site-url')!.status).toBe(expected)
  }
})

it('accepts a build environment URL when Site Config retains fallback priority', () => {
  const config = { url: 'https://example.com', name: 'Example', _priority: { url: -4 } }
  const stack = [{ url: 'http://localhost:3000', _priority: -4, _context: 'nitro:init' }, { url: 'https://example.com', _priority: -1, _context: 'buildEnv' }]
  const results = evaluateSetupChecklist({
    installedModuleSlugs: new Set(['site-config', 'sitemap']),
    debugData: new Map([
      ['site-config', { config, stack }],
      ['sitemap', { siteConfig: config, globalSources: [], sitemaps: {} }],
    ]),
  })
  expect(results.every(result => result.requiredPending === 0)).toBe(true)
})

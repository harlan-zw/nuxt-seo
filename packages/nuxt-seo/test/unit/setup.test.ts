import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { evaluateSetupChecklist } from 'nuxtseo-shared/checklist'
import { describe, expect, it, vi } from 'vitest'
import { collectSetupDebugData, createHomepageSetupCheck, reportSetupChecklist } from '../../src/runtime/server/utils/setup'
import { claimSetupReport } from '../../src/runtime/server/utils/setup-report'

describe('quiet terminal reporting', () => {
  function results(url: string, { name = 'Example', tipsEnabled = true } = {}) {
    return evaluateSetupChecklist({
      installedModuleSlugs: new Set(['site-config', 'sitemap', 'ai-ready']),
      debugData: new Map([
        ['site-config', { config: { name, url } }],
        ['sitemap', { siteConfig: { url }, globalSources: [], sitemaps: {} }],
      ]),
      context: { ssr: true, hasI18n: false, hasDynamicRoutes: false, hasContent: false, isPrerendered: false, tipsEnabled, moduleOptions: { 'ai-ready': { contentNegotiation: false } } },
    })
  }

  it('warns on missing settings across sessions even while tips are on cooldown', async () => {
    const dependencies = { allowSiteUrlReminder: vi.fn(async () => false), allowTips: vi.fn(async () => false), warn: vi.fn<(message: string) => void>(), info: vi.fn<(message: string) => void>() }
    await reportSetupChecklist(results('', { name: '' }), dependencies)
    await reportSetupChecklist(results('', { name: '' }), dependencies)
    expect(dependencies.warn).toHaveBeenCalledTimes(2)
    expect(dependencies.warn.mock.calls[0]![0]).toContain('Set site.name')
    expect(dependencies.warn.mock.calls[0]![0]).not.toMatch(/NUXT_SITE_URL|Sitemap: Needs setup|Optional tips:/)
    expect(dependencies.info).not.toHaveBeenCalled()
  })

  it('shows one production URL reminder across restarts and repeats it after seven days', async () => {
    const stateDirectory = await mkdtemp(join(tmpdir(), 'nuxt-seo-production-url-'))
    try {
      const now = 1_790_000_000_000
      const week = 7 * 24 * 60 * 60 * 1000
      await claimSetupReport({ report: 'setup-tips', stateDirectory, now: () => now })
      const start = async (timestamp: number) => {
        const warn = vi.fn<(message: string) => void>()
        await reportSetupChecklist(results('http://localhost:3000'), {
          allowSiteUrlReminder: async () => (await claimSetupReport({ report: 'production-site-url', stateDirectory, now: () => timestamp }))._tag === 'Allowed',
          allowTips: async () => (await claimSetupReport({ report: 'setup-tips', stateDirectory, now: () => timestamp }))._tag === 'Allowed',
          warn,
          info: vi.fn(),
        })
        return warn.mock.calls.map(([message]) => message)
      }
      const first = await start(now)
      expect(first).toHaveLength(1)
      expect(first[0]).toContain('localhost work during development.')
      expect(first[0]).toContain('Before deploying')
      expect(first[0]!.match(/NUXT_SITE_URL/g)).toHaveLength(1)
      expect(await start(now + week - 1)).toEqual([])
      expect(await start(now + week)).toHaveLength(1)
    }
    finally {
      await rm(stateDirectory, { recursive: true, force: true })
    }
  })

  it('stays quiet for healthy apps during cooldown and prints available tips as information', async () => {
    const dependencies = { allowSiteUrlReminder: vi.fn(async () => true), allowTips: vi.fn(async () => false), warn: vi.fn<(message: string) => void>(), info: vi.fn<(message: string) => void>() }
    await reportSetupChecklist(results('https://example.com'), dependencies)
    expect(dependencies.info).not.toHaveBeenCalled()
    dependencies.allowTips.mockResolvedValue(true)
    await reportSetupChecklist(results('https://example.com'), dependencies)
    expect(dependencies.info).toHaveBeenCalledWith(expect.stringContaining('aiReady: { llmsTxt: { markdownLinks: true } }'))
    expect(dependencies.allowSiteUrlReminder).not.toHaveBeenCalled()
    expect(dependencies.warn).not.toHaveBeenCalled()
  })

  it('does not touch cooldown storage when configuration disables tips', async () => {
    const dependencies = { allowSiteUrlReminder: vi.fn(async () => true), allowTips: vi.fn(async () => true), warn: vi.fn<(message: string) => void>(), info: vi.fn<(message: string) => void>() }
    await reportSetupChecklist(results('', { tipsEnabled: false }), dependencies)
    expect(dependencies.allowTips).not.toHaveBeenCalled()
    expect(dependencies.warn).toHaveBeenCalledOnce()
    await reportSetupChecklist(results('https://example.com', { tipsEnabled: false }), dependencies)
    expect(dependencies.info).not.toHaveBeenCalled()
  })
})

describe('homepage setup check', () => {
  it('checks a configured localized home after a root redirect, but skips other pages', () => {
    const run = vi.fn(async () => {})
    const check = createHomepageSetupCheck('/app/', run, vi.fn(), ['/app/', '/app/en', '/app/fr'])
    check({ path: '/app/', status: 302, contentType: 'text/html' })
    check({ path: '/app/de', status: 200, contentType: 'text/html' })
    check({ path: '/app/en/about', status: 200, contentType: 'text/html' })
    expect(run).not.toHaveBeenCalled()
    check({ path: '/app/en/', status: 200, contentType: 'text/html' })
    check({ path: '/app/fr', status: 200, contentType: 'text/html' })
    expect(run).toHaveBeenCalledTimes(1)
  })
  it('starts once after successful HTML at the app home, without waiting for checks', async () => {
    const run = vi.fn(() => new Promise<void>(() => {}))
    const check = createHomepageSetupCheck('/app/', run, vi.fn())
    check({ path: '/app/about', status: 200, contentType: 'text/html' })
    check({ path: '/app/', status: 500, contentType: 'text/html' })
    check({ path: '/app/', status: 200, contentType: 'application/json' })
    expect(run).not.toHaveBeenCalled()
    check({ path: '/app/?preview=1', status: 200, contentType: 'text/html; charset=utf-8' })
    check({ path: '/app', status: 200, contentType: 'text/html' })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('surfaces background failure once', async () => {
    const failure = new Error('check failed')
    const report = vi.fn()
    const check = createHomepageSetupCheck('/', () => Promise.reject(failure), report)
    check({ path: '/', status: 200, contentType: 'text/html' })
    await vi.waitFor(() => expect(report).toHaveBeenCalledWith(failure))
    check({ path: '/', status: 200, contentType: 'text/html' })
    expect(report).toHaveBeenCalledTimes(1)
  })
})

describe('setup debug collection', () => {
  it('fetches active modules only, preserves app base and separates unavailable data', async () => {
    const fetch = vi.fn(async (path: string) => {
      if (path.includes('robots'))
        throw new Error('endpoint missing')
      return { config: { url: 'https://example.com' } }
    })
    const result = await collectSetupDebugData({
      installedModuleSlugs: new Set(['site-config', 'robots', 'og-image']),
      disabledModuleSlugs: new Set(['og-image']),
      baseURL: '/app/',
      fetch,
      timeout: 30,
    })
    expect(fetch.mock.calls.map(call => call[0])).toEqual(['/app/__site-config__/debug.json', '/app/__robots__/debug.json'])
    expect(result.get('site-config')).toEqual({ config: { url: 'https://example.com' } })
    expect(result.has('robots')).toBe(false)
    expect(result.has('og-image')).toBe(false)
  })

  it('bounds checks when an endpoint never settles', async () => {
    const result = await collectSetupDebugData({
      installedModuleSlugs: new Set(['site-config']),
      baseURL: '/',
      fetch: () => new Promise(() => {}),
      timeout: 10,
    })
    expect(result.has('site-config')).toBe(false)
  })
})

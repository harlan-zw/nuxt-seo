import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { evaluate, getSetupChecklist } from '../composables/checklist'
import { installedModules } from '../composables/modules'
import { appFetch } from '../composables/rpc'
import { base } from '../composables/state'

vi.mock('../composables/modules', () => ({ installedModules: ref([]) }))
vi.mock('../composables/rpc', () => ({ appFetch: ref(undefined) }))
vi.mock('../composables/state', () => ({ base: ref('/') }))

describe('setup checklist', () => {
  it('keeps optimization tips out of required completion and preserves explicit choices from host metadata', async () => {
    installedModules.value = [{ name: 'nuxt-ai-ready', npm: 'nuxt-ai-ready', title: 'AI Ready', icon: '', route: '' }]
    let optedOut = false
    appFetch.value = vi.fn(async () => ({ installedModuleSlugs: ['ai-ready'], disabledModuleSlugs: [], context: { ssr: true, hasI18n: false, hasDynamicRoutes: true, hasContent: false, isPrerendered: false, moduleOptions: { 'ai-ready': { contentNegotiation: false } }, optOuts: { 'ai-ready': optedOut ? ['llmsTxt.markdownLinks'] : [] } } })) as any
    await evaluate()
    const before = getSetupChecklist().summary.value
    expect(before.recommendedPending).toBe(1)
    expect(before.total).toBe(0)
    expect(before.requiredPending).toBe(0)
    optedOut = true
    await evaluate()
    const after = getSetupChecklist().summary.value
    expect(after.recommendedPending).toBe(0)
    expect(after.total).toBe(before.total)
    expect(after.passed).toBe(before.passed)
    expect(after.unavailable).toBe(before.unavailable)
  })

  it('uses app context for contextual tips and keeps requests inside the app base', async () => {
    installedModules.value = [{ name: 'sitemap', npm: '@nuxtjs/sitemap', title: 'Sitemap', icon: '', route: '' }]
    base.value = '/app/'
    const fetch = vi.fn(async (path: string) => path.endsWith('/setup.json')
      ? { installedModuleSlugs: ['sitemap'], disabledModuleSlugs: [], context: { ssr: true, hasI18n: false, hasDynamicRoutes: true, hasContent: false, moduleOptions: { sitemap: { minify: false } } } }
      : { siteConfig: { url: 'https://example.com' }, globalSources: [{ urls: Array.from({ length: 1000 }, (_, index) => `/page/${index}`) }], sitemaps: {} })
    appFetch.value = fetch as any
    await evaluate()
    const result = getSetupChecklist().getModuleResult('sitemap')!
    expect(result.items.find(item => item.id === 'sitemap-minify')?.status).toBe('failed')
    expect(fetch.mock.calls.map(call => call[0])).toEqual(['/app/__nuxt-seo__/setup.json', '/app/__sitemap__/debug.json'])
    base.value = '/'
  })

  it('evaluates when the host connects after the checklist opens', async () => {
    installedModules.value = [{ name: 'site-config', npm: 'nuxt-site-config', title: 'Site Config', icon: '', route: '' }]
    appFetch.value = undefined
    await evaluate()
    expect(getSetupChecklist().evaluated.value).toBe(false)
    appFetch.value = vi.fn(async () => ({ config: { url: 'https://example.com', name: 'Example' } })) as any
    await vi.waitFor(() => {
      expect(getSetupChecklist().evaluated.value).toBe(true)
      expect(getSetupChecklist().getModuleResult('site-config')?.status).toBe('configured')
    })
  })

  it('matches site config by npm when the server returns catalog names', async () => {
    installedModules.value = [{ name: 'site-config', npm: 'nuxt-site-config', title: 'Site Config', icon: '', route: '' }]
    appFetch.value = vi.fn(async () => ({ config: { url: 'https://example.com', name: 'Example' } })) as any
    await evaluate()
    const result = getSetupChecklist().getModuleResultByName('nuxt-site-config')!
    expect(result.requiredPending).toBe(0)
    expect(result.items.find(item => item.id === 'site-url')?.passed).toBe(true)
  })

  it('shows failed debug requests as unchecked without missing setup warnings', async () => {
    installedModules.value = [{ name: 'nuxt-robots', npm: '@nuxtjs/robots', title: 'Robots', icon: '', route: '' }]
    appFetch.value = vi.fn(async () => {
      throw new Error('unavailable')
    }) as any
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    await evaluate()
    const result = getSetupChecklist().getModuleResult('robots')!
    expect(result.status).toBe('unavailable')
    expect(result.requiredPending).toBe(0)
    expect(getSetupChecklist().summary.value.unavailable).toBeGreaterThan(0)
    expect(result.items.some(item => item.status === 'passed')).toBe(false)
    expect(warning).toHaveBeenCalled()
    expect(getSetupChecklist().loading.value).toBe(false)
    warning.mockRestore()
  })

  it('does not fetch explicitly disabled modules', async () => {
    installedModules.value = [{ name: 'nuxt-og-image', npm: 'nuxt-og-image', title: 'OG Image', icon: '', route: '', disabled: true }]
    const fetch = vi.fn(async () => ({}))
    appFetch.value = fetch as any
    await evaluate()
    expect(fetch.mock.calls).toEqual([['/__nuxt-seo__/setup.json', { timeout: 3000, retry: 0 }]])
    expect(getSetupChecklist().getModuleResult('og-image')?.status).toBe('disabled')
  })
})

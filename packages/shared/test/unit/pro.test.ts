import { afterEach, expect, it, vi } from 'vitest'
import { hookNuxtSeoProDataUpload } from '../../src/pro'

const { hooks, fetch, nuxt } = vi.hoisted(() => {
  const hooks = new Map<string, () => Promise<void>>()
  const fetch = vi.fn().mockResolvedValue({ ok: true })
  return { hooks, fetch, nuxt: { options: { dev: false, _prepare: false, runtimeConfig: { seoProKey: 'fixture-key' }, _installedModules: [] }, _isNuxtSeoProUploading: false, hooks: { hook: (name: string, fn: () => Promise<void>) => {
    hooks.set(name, fn)
  }, callHook: vi.fn() } } }
})
vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  useNuxt: () => nuxt,
  hasNuxtModule: () => false,
  useLogger: () => ({ debug: vi.fn() }),
}))
vi.mock('std-env', async importOriginal => ({ ...await importOriginal<typeof import('std-env')>(), isTest: false }))
vi.mock('ofetch', async importOriginal => ({ ...await importOriginal<typeof import('ofetch')>(), $fetch: fetch }))
vi.mock('nuxt-site-config/kit', () => {
  throw new Error('Optional Site Config was loaded')
})
afterEach(() => {
  vi.unstubAllEnvs()
})
it('registers licensed uploads without importing an absent Site Config module', async () => {
  vi.stubEnv('VITEST', '')
  hookNuxtSeoProDataUpload()
  await hooks.get('build:before')!()
  expect(fetch).toHaveBeenCalledWith('https://nuxtseo.com/api/pro/verify', expect.objectContaining({
    method: 'POST',
    body: expect.objectContaining({ apiKey: 'fixture-key', siteUrl: undefined, siteName: undefined }),
  }))
})

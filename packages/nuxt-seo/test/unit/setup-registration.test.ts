import type { Nuxt } from '@nuxt/schema'
import { afterEach, expect, it, vi } from 'vitest'
import { setupDevelopmentChecks } from '../../src/setup'

const adapters = vi.hoisted(() => ({ plugin: vi.fn(), template: vi.fn(), handler: vi.fn(), compatibility: vi.fn() }))

vi.mock('@nuxt/kit', () => ({
  addServerPlugin: adapters.plugin,
  addServerHandler: adapters.handler,
  addServerTemplate: adapters.template,
  createResolver: () => ({ resolve: (path: string) => path }),
}))

vi.mock('nuxtseo-shared/kit', () => ({ setupNitroRuntimeCompatibility: adapters.compatibility }))

afterEach(() => vi.clearAllMocks())

function fixture(dev: boolean) {
  const hooks = new Map<string, (...args: any[]) => unknown>()
  const nuxt = {
    options: {
      dev,
      ssr: false,
      app: { baseURL: '/app/' },
      nitro: { preset: 'static' },
      i18n: { locales: ['en', 'fr'] },
      sitemap: { enabled: true, zeroRuntime: false, sourceToken: 'private' },
      ogImage: false,
      schemaOrg: { enabled: false },
      _installedModules: [
        { meta: { name: '@nuxtjs/sitemap' } },
        { meta: { name: 'nuxt-og-image' } },
        { meta: { name: 'nuxt-schema-org' } },
        { meta: { name: '@nuxtjs/robots', disabled: true } },
        { meta: { name: 'nuxt-site-config' } },
        { meta: { name: '@nuxtjs/i18n' } },
      ],
    },
    hook: (name: string, fn: (...args: any[]) => unknown) => hooks.set(name, fn),
  }
  return { nuxt: nuxt as unknown as Nuxt, hooks }
}

it('keeps runtime setup checks out of production', () => {
  const { nuxt, hooks } = fixture(false)
  setupDevelopmentChecks(nuxt)
  hooks.get('modules:done')?.()
  expect(adapters.plugin).not.toHaveBeenCalled()
  expect(adapters.template).not.toHaveBeenCalled()
  expect(adapters.handler).not.toHaveBeenCalled()
})

it('captures active modules, disabled configuration and dynamic nested pages without private options', () => {
  const { nuxt, hooks } = fixture(true)
  setupDevelopmentChecks(nuxt)
  hooks.get('pages:extend')?.([{ path: '/blog', children: [{ path: ':slug' }] }])
  hooks.get('modules:done')?.()
  const template = adapters.template.mock.calls[0]![0]
  const config = JSON.parse(template.getContents().slice('export default '.length))
  expect(new Set(config.installedModuleSlugs)).toEqual(new Set(['site-config', 'sitemap']))
  expect(config.disabledModuleSlugs).toEqual(expect.arrayContaining(['og-image', 'schema-org', 'robots']))
  expect(config.context).toEqual({
    ssr: false,
    hasI18n: true,
    hasDynamicRoutes: true,
    hasContent: false,
    isPrerendered: true,
    moduleOptions: { 'sitemap': { enabled: true, zeroRuntime: false }, 'schema-org': { enabled: false } },
  })
  expect(config.baseURL).toBe('/app/')
  expect(config.homepagePaths).toEqual(['/app/', '/app/en', '/app/fr'])
  expect(adapters.plugin).toHaveBeenCalledWith('./runtime/server/plugins/setup')
  expect(adapters.handler).toHaveBeenCalledWith({ route: '/__nuxt-seo__/setup.json', handler: './runtime/server/routes/setup.json' })
})

it('ignores an auto-installed i18n module without configured locales', () => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { i18n: { locales: [] } })
  setupDevelopmentChecks(nuxt)
  hooks.get('modules:done')?.()
  const config = JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
  expect(config.context.hasI18n).toBe(false)
})

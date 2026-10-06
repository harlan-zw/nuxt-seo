import type { Nuxt } from '@nuxt/schema'
import { defineNuxtModule } from '@nuxt/kit'
import { evaluateSetupChecklist } from 'nuxtseo-shared/checklist'
import { afterEach, expect, it, vi } from 'vitest'
import setupPlugin from '../../src/runtime/server/plugins/setup'
import { setupDevelopmentChecks } from '../../src/setup'

const adapters = vi.hoisted(() => ({ plugin: vi.fn(), template: vi.fn(), handler: vi.fn(), compatibility: vi.fn(() => ({ _tag: 'nitro-v2' })) }))
const automation = vi.hoisted(() => ({ agent: false, ci: false }))
const runtime = vi.hoisted(() => ({
  setup: { nitroBuilder: 'nitro-v2', baseURL: '/', homepagePaths: ['/'], installedModuleSlugs: [], disabledModuleSlugs: [], stateDirectory: '/state', context: {} },
  report: vi.fn(),
}))

vi.mock('#nuxt-seo/setup.mjs', () => ({ default: runtime.setup }))
vi.mock('#nuxtseo/h3', () => ({
  getRequestURL: (event: { path: string }) => new URL(event.path, 'https://example.com'),
  getResponseHeader: (event: { node: { res: { getHeader: (name: string) => string } } }, name: string) => event.node.res.getHeader(name),
}))
vi.mock('#nuxtseo/nitro', () => ({ defineNitroPlugin: (plugin: unknown) => plugin, fetchWithEvent: vi.fn() }))
vi.mock('#site-config/server', () => ({ getSiteConfig: () => ({ url: 'https://example.com', name: 'Example' }) }))
vi.mock('../../src/runtime/server/utils/setup-report', () => ({ claimSetupTips: async () => ({ _tag: 'Allowed' }) }))
vi.mock('../../src/runtime/server/utils/setup', async importOriginal => ({
  ...await importOriginal<typeof import('../../src/runtime/server/utils/setup')>(),
  reportSetupChecklist: runtime.report,
}))

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  addServerPlugin: adapters.plugin,
  addServerHandler: adapters.handler,
  addServerTemplate: adapters.template,
  createResolver: () => ({ resolve: (path: string) => path }),
  getNuxtVersion: () => '4.5.2',
}))

vi.mock('nuxtseo-shared/kit', () => ({
  setupNitroRuntimeCompatibility: adapters.compatibility,
  resolveNitroPreset: (config: any) => config.preset || 'node-server',
  get isAgent() {
    return automation.agent
  },
  get isCI() {
    return automation.ci
  },
}))

afterEach(() => {
  vi.clearAllMocks()
  adapters.compatibility.mockReturnValue({ _tag: 'nitro-v2' })
  automation.agent = false
  automation.ci = false
  runtime.setup.nitroBuilder = 'nitro-v2'
})

it.each(['nitro-v2', 'nitro-v3'])('checks only successful homepage responses through %s lifecycle', async (builder) => {
  runtime.setup.nitroBuilder = builder
  const hooks = new Map<string, (...args: any[]) => unknown>()
  setupPlugin({ hooks: { hook: (name: string, callback: (...args: any[]) => unknown) => hooks.set(name, callback) } } as never)
  const event = { path: '/', context: {} }
  if (builder === 'nitro-v3') {
    expect(hooks.has('render:response')).toBe(false)
    const response = new Response('Missing', { status: 404, headers: { 'content-type': 'text/html' } })
    hooks.get('response')!(response, event)
    expect(response.status).toBe(404)
    expect(runtime.report).not.toHaveBeenCalled()
    hooks.get('response')!(new Response('Homepage', { headers: { 'content-type': 'text/html' } }), event)
  }
  else {
    expect(hooks.has('response')).toBe(false)
    hooks.get('render:response')!({ statusCode: 404, headers: { 'content-type': 'text/html' } }, { event })
    expect(runtime.report).not.toHaveBeenCalled()
    hooks.get('render:response')!({ statusCode: 200, headers: { 'content-type': 'text/html' } }, { event })
  }
  await vi.waitFor(() => expect(runtime.report).toHaveBeenCalledOnce())
})

it('reads Nitro 2 response headers only when the render response omits its headers', async () => {
  const hooks = new Map<string, (...args: any[]) => unknown>()
  setupPlugin({ hooks: { hook: (name: string, callback: (...args: any[]) => unknown) => hooks.set(name, callback) } } as never)
  const event = { path: '/', context: {}, node: { res: { getHeader: (name: string) => name === 'content-type' ? 'text/html;charset=utf-8' : undefined } } }
  hooks.get('render:response')!({ statusCode: 200, headers: { 'content-type': 'application/json' } }, { event })
  expect(runtime.report).not.toHaveBeenCalled()
  hooks.get('render:response')!({ statusCode: 200 }, { event })
  await vi.waitFor(() => expect(runtime.report).toHaveBeenCalledOnce())
})

it.each(['nitro-v2', 'nitro-v3'])('selects the real %s builder for development response checks', async (builder) => {
  adapters.compatibility.mockReturnValue({ _tag: builder })
  const { nuxt, hooks } = fixture(true)
  setupDevelopmentChecks(nuxt)
  await hooks.get('modules:done')?.()
  const metadata = JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
  expect(metadata.nitroBuilder).toBe(builder)
})

function fixture(dev: boolean) {
  const hooks = new Map<string, (...args: any[]) => unknown>()
  const nuxt = {
    options: {
      dev,
      buildDir: '/project/.nuxt',
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

it('keeps runtime setup checks out of production', async () => {
  const { nuxt, hooks } = fixture(false)
  setupDevelopmentChecks(nuxt)
  await hooks.get('modules:done')?.()
  expect(adapters.plugin).not.toHaveBeenCalled()
  expect(adapters.template).not.toHaveBeenCalled()
  expect(adapters.handler).not.toHaveBeenCalled()
})

it.each(['agent', 'ci'] as const)('keeps DevTools metadata available but skips terminal checks for %s sessions', async (environment) => {
  automation[environment] = true
  const { nuxt, hooks } = fixture(true)
  setupDevelopmentChecks(nuxt)
  await hooks.get('modules:done')?.()
  expect(adapters.plugin).not.toHaveBeenCalled()
  expect(adapters.handler).toHaveBeenCalledOnce()
})

it('passes the tips opt-out to shared metadata without removing required checks', async () => {
  const { nuxt, hooks } = fixture(true)
  setupDevelopmentChecks(nuxt, { tips: false })
  await hooks.get('modules:done')?.()
  const metadata = JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
  expect(metadata.context.tipsEnabled).toBe(false)
  const results = evaluateSetupChecklist({ installedModuleSlugs: new Set(metadata.installedModuleSlugs), context: metadata.context, debugData: new Map([['site-config', { config: { url: '', name: '' } }]]) })
  expect(results.find(result => result.moduleSlug === 'site-config')?.requiredPending).toBe(2)
})

it('captures active modules, disabled configuration and dynamic nested pages without private options', async () => {
  const { nuxt, hooks } = fixture(true)
  setupDevelopmentChecks(nuxt)
  hooks.get('pages:extend')?.([{ path: '/blog', children: [{ path: ':slug' }] }])
  await hooks.get('modules:done')?.()
  const template = adapters.template.mock.calls[0]![0]
  const config = JSON.parse(template.getContents().slice('export default '.length))
  expect(new Set(config.installedModuleSlugs)).toEqual(new Set(['site-config', 'sitemap']))
  expect(config.disabledModuleSlugs).toEqual(expect.arrayContaining(['og-image', 'schema-org', 'robots']))
  expect(config.context).toEqual({
    tipsEnabled: true,
    ssr: false,
    hasI18n: true,
    hasDynamicRoutes: true,
    hasContent: false,
    isPrerendered: true,
    hasPrerenderedRoutes: false,
    devtoolsEnabled: false,
    nuxtMajor: 4,
    nitroPreset: 'static',
    sitemapPrerendered: false,
    hasSitemapOutputHook: false,
    moduleOptions: { 'sitemap': { enabled: true, zeroRuntime: false }, 'schema-org': { enabled: false } },
    optOuts: { 'sitemap': ['zeroRuntime'], 'schema-org': ['enabled'] },
  })
  expect(config.baseURL).toBe('/app/')
  expect(config.homepagePaths).toEqual(['/app/', '/app/en', '/app/fr'])
  expect(adapters.plugin).toHaveBeenCalledWith('./runtime/server/plugins/setup')
  expect(adapters.handler).toHaveBeenCalledWith({ route: '/__nuxt-seo__/setup.json', handler: './runtime/server/routes/setup.json' })
})

it('ignores an auto-installed i18n module without configured locales', async () => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { i18n: { locales: [] } })
  setupDevelopmentChecks(nuxt)
  await hooks.get('modules:done')?.()
  const config = JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
  expect(config.context.hasI18n).toBe(false)
})

function installSitemapFixture(inlineOptions: Record<string, unknown> = {}) {
  const { nuxt, hooks } = fixture(true)
  const defaults = { enabled: true, minify: false, zeroRuntime: false, zeroPrerender: false, experimentalStreaming: false }
  const module = defineNuxtModule({
    meta: { name: '@nuxtjs/sitemap', configKey: 'sitemap' },
    defaults,
    setup: () => { throw new Error('Diagnostics must not rerun module setup') },
  })
  const userConfig = { privateToken: 'config-secret', sources: [['/api/posts', { headers: { Authorization: 'source-secret' } }]] }
  Object.assign(nuxt.options, {
    sitemap: userConfig,
    modules: [[module, inlineOptions]],
    _installedModules: [{ meta: { name: '@nuxtjs/sitemap' }, module }],
  })
  return { nuxt, hooks, defaults, userConfig }
}

async function readSetupMetadata(nuxt: Nuxt, hooks: ReturnType<typeof fixture>['hooks']) {
  setupDevelopmentChecks(nuxt)
  await hooks.get('modules:done')?.()
  return JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
}

it('reads real module defaults without enabling options or publishing private configuration', async () => {
  const { nuxt, hooks, defaults, userConfig } = installSitemapFixture({ privateToken: 'inline-secret' })
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.context.moduleOptions.sitemap).toEqual(defaults)
  expect(metadata.context.optOuts.sitemap).toEqual([])
  expect(JSON.stringify(metadata)).not.toContain('secret')
  expect(defaults.minify).toBe(false)
  expect(userConfig.privateToken).toBe('config-secret')
})

it('respects inline disable options through the real module getter', async () => {
  const { nuxt, hooks } = installSitemapFixture({ enabled: false })
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.installedModuleSlugs).not.toContain('sitemap')
  expect(metadata.disabledModuleSlugs).toContain('sitemap')
  expect(metadata.context.moduleOptions.sitemap.enabled).toBe(false)
})

it('suggests a default opt-in but respects explicit inline false', async () => {
  for (const [inline, shouldSuggest] of [[{}, true], [{ minify: false }, false]] as const) {
    vi.clearAllMocks()
    const { nuxt, hooks } = installSitemapFixture(inline)
    const metadata = await readSetupMetadata(nuxt, hooks)
    const [result] = evaluateSetupChecklist({
      installedModuleSlugs: new Set(['sitemap']),
      context: metadata.context,
      debugData: new Map([['sitemap', {
        siteConfig: { url: 'https://example.com' },
        globalSources: [{ urls: Array.from({ length: 1000 }, (_, i) => `/post/${i}`) }],
        sitemaps: {},
      }]]),
    })
    expect(result!.items.some(item => item.id === 'sitemap-minify')).toBe(shouldSuggest)
  }
})

it.each([undefined, false, { enabled: false }])('recognizes default DevTools unless explicitly disabled by %j', async (devtools) => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { devtools })
  nuxt.options._installedModules.push({ meta: { name: '@nuxt/devtools' } } as never)
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.context.devtoolsEnabled).toBe(devtools === undefined)
})

it('reads prerendered pages and sitemap routes from route rules', async () => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { routeRules: { '/about': { prerender: true }, '/sitemap.xml': { prerender: true } } })
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.context.hasPrerenderedRoutes).toBe(true)
  expect(metadata.context.sitemapPrerendered).toBe(true)
})

it('respects disabled DevTools module metadata', async () => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { devtools: { enabled: true } })
  nuxt.options._installedModules.push({ meta: { name: '@nuxt/devtools', disabled: true } } as never)
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.context.devtoolsEnabled).toBe(false)
})

it('respects Nitro overrides and keeps wildcard prerender separate from a fully static app', async () => {
  const { nuxt, hooks } = fixture(true)
  Object.assign(nuxt.options, { routeRules: { '/sitemap.xml': { prerender: true }, '/**': { prerender: true } } })
  Object.assign(nuxt.options.nitro, { preset: 'node-server', routeRules: { '/sitemap.xml': { prerender: false } } })
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.context.hasPrerenderedRoutes).toBe(true)
  expect(metadata.context.sitemapPrerendered).toBe(false)
  expect(metadata.context.isPrerendered).toBe(false)
})

it('keeps a raw disabled module disabled despite inline options', async () => {
  const { nuxt, hooks } = installSitemapFixture({ enabled: true, minify: true })
  Object.assign(nuxt.options, { sitemap: false })
  const metadata = await readSetupMetadata(nuxt, hooks)
  expect(metadata.installedModuleSlugs).not.toContain('sitemap')
  expect(metadata.disabledModuleSlugs).toContain('sitemap')
})

it.each([
  [{ llmsTxt: { markdownLinks: false } }, { llmsTxt: { title: 'Guide' } }, false],
  [{ llmsTxt: false }, { llmsTxt: { title: 'Guide' } }, true],
  [{ llmsTxt: { markdownLinks: true } }, { llmsTxt: false }, false],
  [{ llmsTxt: { markdownLinks: false } }, { llmsTxt: { markdownLinks: null, title: 'Guide' } }, false],
])('respects nested user choices %j with inline options %j', async (config, inline, shouldSuggest) => {
  const { nuxt, hooks } = fixture(true)
  const module = defineNuxtModule({
    meta: { name: 'nuxt-ai-ready', configKey: 'aiReady' },
    defaults: { enabled: true, contentNegotiation: false, llmsTxt: { markdownLinks: false } },
  })
  Object.assign(nuxt.options, {
    ssr: true,
    aiReady: config,
    modules: [[module, inline]],
    _installedModules: [{ meta: { name: 'nuxt-ai-ready' }, module }],
  })
  Object.assign(nuxt.options.nitro, { preset: 'node-server' })
  setupDevelopmentChecks(nuxt)
  hooks.get('pages:extend')?.([{ path: '/post/:slug' }])
  await hooks.get('modules:done')?.()
  const metadata = JSON.parse(adapters.template.mock.calls[0]![0].getContents().slice('export default '.length))
  const [result] = evaluateSetupChecklist({
    installedModuleSlugs: new Set(['ai-ready']),
    context: metadata.context,
    debugData: new Map(),
  })
  expect(result!.items.some(item => item.id === 'markdown-links')).toBe(shouldSuggest)
})

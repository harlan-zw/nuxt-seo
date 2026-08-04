import type { Nuxt } from '@nuxt/schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderNitroTypeAugmentations, setupNitroRuntimeCompatibility } from '../../src/kit'

const { addTypeTemplateMock, getNuxtVersionMock, hookOnceMock, resolveModuleMock } = vi.hoisted(() => ({
  addTypeTemplateMock: vi.fn(),
  getNuxtVersionMock: vi.fn(),
  hookOnceMock: vi.fn(),
  resolveModuleMock: vi.fn(),
}))

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  addTypeTemplate: addTypeTemplateMock,
  getNuxtVersion: getNuxtVersionMock,
  resolveModule: resolveModuleMock,
}))

function createNuxt(): Nuxt {
  return {
    hooks: {
      hookOnce: hookOnceMock,
    },
    options: {
      nitro: {},
    },
  } as Nuxt
}

describe('setupNitroRuntimeCompatibility', () => {
  beforeEach(() => {
    addTypeTemplateMock.mockReset()
    getNuxtVersionMock.mockReset()
    hookOnceMock.mockReset()
    resolveModuleMock.mockReset()
    resolveModuleMock.mockReturnValue('/resolved/ofetch.mjs')
  })

  it('registers Nitro 2 runtime virtual module and H3 alias', async () => {
    getNuxtVersionMock.mockReturnValue('4.5.1')
    const nuxt = createNuxt()

    const compatibility = setupNitroRuntimeCompatibility(nuxt)

    expect(compatibility).toEqual({
      _tag: 'nitro-v2',
      eventContextModule: 'h3',
      eventContextType: 'H3EventContext',
      eventType: 'import(\'h3\').H3Event',
      nitroTypesModule: 'nitropack',
    })
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('from \'nitropack/runtime\'')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('useEvent')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('defineCachedEventHandler')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('event.$fetch(request, options)')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('h3')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/ofetch']).toBeUndefined()
    expect(resolveModuleMock).not.toHaveBeenCalled()
    expect(addTypeTemplateMock).toHaveBeenCalledOnce()
    expect(addTypeTemplateMock).toHaveBeenCalledWith(expect.any(Object), { nitro: true, nuxt: true })

    const template = addTypeTemplateMock.mock.calls[0]![0]
    await expect(template.getContents()).resolves.toContain('declare module \'#nuxtseo/nitro\'')
    await expect(template.getContents()).resolves.toContain('from \'nitropack/runtime\'')
    await expect(template.getContents()).resolves.toContain('export function fetchWithEvent<T>')
  })

  it('registers Nitro 3 runtime entrypoints and type targets', async () => {
    getNuxtVersionMock.mockReturnValue('5.0.0-29762522.15e6ea5a')
    const nuxt = createNuxt()

    const compatibility = setupNitroRuntimeCompatibility(nuxt)

    expect(compatibility).toEqual({
      _tag: 'nitro-v3',
      eventContextModule: 'srvx',
      eventContextType: 'ServerRequestContext',
      eventType: 'import(\'nitro/h3\').H3Event',
      nitroTypesModule: 'nitro/types',
    })
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('definePlugin as defineNitroPlugin } from \'nitro\'')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('useRuntimeConfig(_event)')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).not.toContain('getRouteRules')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('useRequest as useEvent } from \'nitro/context\'')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('defineCachedHandler as defineCachedEventHandler')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('fetchRawWithEvent(event, input, init)')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('from \'#nuxtseo/ofetch\'')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('nitro/h3')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/ofetch']).toBe('/resolved/ofetch.mjs')
    expect(resolveModuleMock).toHaveBeenCalledWith('ofetch', { url: expect.any(URL) })
    expect(addTypeTemplateMock).toHaveBeenCalledWith(expect.any(Object), { nitro: true, nuxt: true })

    const template = addTypeTemplateMock.mock.calls[0]![0]
    await expect(template.getContents()).resolves.toContain('import(\'nitro/runtime-config\')')
    await expect(template.getContents()).resolves.toContain('useRuntimeConfig(event?:')
    await expect(template.getContents()).resolves.toContain('defineCachedHandler as defineCachedEventHandler')
    await expect(template.getContents()).resolves.toContain('export * from \'nitro/h3\'')
    await expect(template.getContents()).resolves.toContain('export function fetchWithEvent<T>')
  })

  it('registers shared templates once when several modules call setup', () => {
    getNuxtVersionMock.mockReturnValue('4.5.1')
    const nuxt = createNuxt()

    setupNitroRuntimeCompatibility(nuxt)
    setupNitroRuntimeCompatibility(nuxt)

    expect(addTypeTemplateMock).toHaveBeenCalledOnce()
  })

  it('registers the request context type bridge after an older helper ran', async () => {
    getNuxtVersionMock.mockReturnValue('5.0.0')
    const nuxt = createNuxt() as Nuxt & { [key: symbol]: true }
    nuxt[Symbol.for('nuxtseo:nitro-runtime-compatibility')] = true

    setupNitroRuntimeCompatibility(nuxt)

    expect(addTypeTemplateMock).toHaveBeenCalledOnce()
    const template = addTypeTemplateMock.mock.calls[0]![0]
    await expect(template.getContents()).resolves.toContain('useRequest as useEvent')
  })

  it('prevents an older helper from overwriting a newer runtime bridge', () => {
    getNuxtVersionMock.mockReturnValue('5.0.0')
    const nuxt = createNuxt() as Nuxt & { [key: symbol]: true | undefined }

    setupNitroRuntimeCompatibility(nuxt)

    expect(nuxt[Symbol.for('nuxtseo:nitro-runtime-compatibility')]).toBe(true)
  })

  it('reasserts the runtime bridge after all modules finish setup', () => {
    getNuxtVersionMock.mockReturnValue('5.0.0')
    const nuxt = createNuxt()

    setupNitroRuntimeCompatibility(nuxt)
    nuxt.options.nitro.virtual!['#nuxtseo/nitro'] = 'stale runtime bridge'

    expect(hookOnceMock).toHaveBeenCalledOnce()
    const applyCompatibility = hookOnceMock.mock.calls[0]![1]
    applyCompatibility()

    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('useRequest as useEvent')
  })
})

describe('renderNitroTypeAugmentations', () => {
  it('targets Nitro 3 route and request context types', () => {
    getNuxtVersionMock.mockReturnValue('5.0.0')
    const compatibility = setupNitroRuntimeCompatibility(createNuxt())

    expect(renderNitroTypeAugmentations(compatibility, {
      eventContext: 'siteConfig: SiteConfig',
      routeConfig: 'site?: SiteConfig',
      routeRules: 'site?: SiteConfigInput',
      runtimeHooks: '\'site-config:init\': (ctx: HookContext) => void',
    })).toBe(`declare module 'nitro/types' {
  interface NitroRouteRules {
    site?: SiteConfigInput
  }
  interface NitroRouteConfig {
    site?: SiteConfig
  }
  interface NitroRuntimeHooks {
    'site-config:init': (ctx: HookContext) => void
  }
}

declare module 'srvx' {
  interface ServerRequestContext {
    siteConfig: SiteConfig
  }
}`)
  })

  it('omits unused augmentation interfaces', () => {
    getNuxtVersionMock.mockReturnValue('4.5.1')
    const compatibility = setupNitroRuntimeCompatibility(createNuxt())

    expect(renderNitroTypeAugmentations(compatibility, {
      runtimeHooks: '\'build:done\': () => void',
    })).toBe(`declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'build:done': () => void
  }
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    'build:done': () => void
  }
}`)
  })

  it('renders module-specific Nitro interfaces and omits empty entries', () => {
    getNuxtVersionMock.mockReturnValue('5.0.0')
    const compatibility = setupNitroRuntimeCompatibility(createNuxt())

    expect(renderNitroTypeAugmentations(compatibility, {
      nitroInterfaces: {
        NitroApp: '_robots?: RobotsState',
        PrerenderRoute: '_sitemap?: SitemapUrl',
        EmptyInterface: '  ',
      },
    })).toBe(`declare module 'nitro/types' {
  interface NitroApp {
    _robots?: RobotsState
  }
  interface PrerenderRoute {
    _sitemap?: SitemapUrl
  }
}`)
  })
})

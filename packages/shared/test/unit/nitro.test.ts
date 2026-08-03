import type { Nuxt } from '@nuxt/schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { renderNitroTypeAugmentations, setupNitroRuntimeCompatibility } from '../../src/kit'

const { addTypeTemplateMock, getNuxtVersionMock } = vi.hoisted(() => ({
  addTypeTemplateMock: vi.fn(),
  getNuxtVersionMock: vi.fn(),
}))

vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  addTypeTemplate: addTypeTemplateMock,
  getNuxtVersion: getNuxtVersionMock,
}))

function createNuxt(): Nuxt {
  return {
    options: {
      nitro: {},
    },
  } as Nuxt
}

describe('setupNitroRuntimeCompatibility', () => {
  beforeEach(() => {
    addTypeTemplateMock.mockReset()
    getNuxtVersionMock.mockReset()
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
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('h3')
    expect(addTypeTemplateMock).toHaveBeenCalledOnce()
    expect(addTypeTemplateMock).toHaveBeenCalledWith(expect.any(Object), { nitro: true, nuxt: true })

    const template = addTypeTemplateMock.mock.calls[0]![0]
    await expect(template.getContents()).resolves.toContain('declare module \'#nuxtseo/nitro\'')
    await expect(template.getContents()).resolves.toContain('from \'nitropack/runtime\'')
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
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).toContain('useRuntimeConfig } from \'nitro/runtime-config\'')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).not.toContain('getRouteRules')
    expect(nuxt.options.nitro.virtual?.['#nuxtseo/nitro']).not.toContain('useEvent')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('nitro/h3')
    expect(addTypeTemplateMock).toHaveBeenCalledWith(expect.any(Object), { nitro: true, nuxt: true })

    const template = addTypeTemplateMock.mock.calls[0]![0]
    await expect(template.getContents()).resolves.toContain('from \'nitro/runtime-config\'')
    await expect(template.getContents()).resolves.toContain('export * from \'nitro/h3\'')
  })

  it('registers shared templates once when several modules call setup', () => {
    getNuxtVersionMock.mockReturnValue('4.5.1')
    const nuxt = createNuxt()

    setupNitroRuntimeCompatibility(nuxt)
    setupNitroRuntimeCompatibility(nuxt)

    expect(addTypeTemplateMock).toHaveBeenCalledOnce()
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
}`)
  })
})

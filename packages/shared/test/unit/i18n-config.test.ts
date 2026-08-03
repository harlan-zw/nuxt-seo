import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mapPathForI18nPages, resolveI18nConfig } from '../../src/i18n'

const nuxtKitMocks = vi.hoisted(() => ({
  getNuxtModuleVersion: vi.fn(),
  hasNuxtModule: vi.fn(),
  hasNuxtModuleCompatibility: vi.fn(),
}))

const sharedKitMocks = vi.hoisted(() => ({
  getNuxtModuleOptions: vi.fn(),
}))

vi.mock('@nuxt/kit', () => nuxtKitMocks)
vi.mock('../../src/kit', () => sharedKitMocks)

describe('resolveI18nConfig', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    nuxtKitMocks.hasNuxtModule.mockImplementation(module => module === 'nuxt-i18n-micro')
  })

  it('uses nuxt-i18n-micro global locale routes as pages', async () => {
    sharedKitMocks.getNuxtModuleOptions.mockResolvedValue({
      locales: [{ code: 'en' }, { code: 'fr' }, { code: 'de' }],
      defaultLocale: 'en',
      strategy: 'prefix_except_default',
      globalLocaleRoutes: {
        checkout: { en: '/checkout', fr: '/paiement', de: '/kasse' },
        about: { en: '/about', fr: '/a-propos', de: '/ueber-uns' },
        disabled: false,
        inherited: true,
      },
    })

    const config = await resolveI18nConfig()

    expect(config).not.toBe(false)
    if (!config)
      return
    expect(config.pages).toEqual({
      checkout: { en: '/checkout', fr: '/paiement', de: '/kasse' },
      about: { en: '/about', fr: '/a-propos', de: '/ueber-uns' },
    })
    expect(mapPathForI18nPages('/checkout', config)).toEqual([
      '/fr/paiement',
      '/de/kasse',
    ])
  })
})

import type { AutoI18nConfig, NormalisedLocale, StrategyProps } from '../../src/i18n'
import { describe, expect, it } from 'vitest'
import {
  generatePathForI18nPages,
  mapPathForI18nPages,
  mergeOnKey,
  normalizeLocales,
  splitPathForI18nLocales,
} from '../../src/i18n'

function makeLocale(code: string, overrides: Partial<NormalisedLocale> = {}): NormalisedLocale {
  return {
    code,
    _sitemap: code,
    _hreflang: code,
    ...overrides,
  }
}

function makeAutoI18n(overrides: Partial<AutoI18nConfig> = {}): AutoI18nConfig {
  return {
    locales: [makeLocale('en'), makeLocale('fr'), makeLocale('es')],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    ...overrides,
  }
}

// -------------------------------------------------------------------
// mergeOnKey
// -------------------------------------------------------------------
describe('mergeOnKey', () => {
  it('merges objects with the same key', () => {
    const result = mergeOnKey(
      [
        { code: 'en', name: 'English' },
        { code: 'en', iso: 'en-US' },
      ],
      'code',
    )
    expect(result).toEqual([{ code: 'en', name: 'English', iso: 'en-US' }])
  })

  it('preserves distinct entries', () => {
    const result = mergeOnKey(
      [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
      ],
      'code',
    )
    expect(result).toHaveLength(2)
  })

  it('later values override earlier ones', () => {
    const result = mergeOnKey(
      [
        { code: 'en', name: 'Old' },
        { code: 'en', name: 'New' },
      ],
      'code',
    )
    expect(result[0].name).toBe('New')
  })

  it('handles empty array', () => {
    expect(mergeOnKey([], 'code')).toEqual([])
  })
})

// -------------------------------------------------------------------
// normalizeLocales
// -------------------------------------------------------------------
describe('normalizeLocales', () => {
  it('converts string locales to objects with _hreflang and _sitemap', () => {
    const result = normalizeLocales({ locales: ['en', 'fr'] } as any)
    expect(result).toEqual([
      { code: 'en', _hreflang: 'en', _sitemap: 'en' },
      { code: 'fr', _hreflang: 'fr', _sitemap: 'fr' },
    ])
  })

  it('uses language field for _hreflang and _sitemap when present', () => {
    const result = normalizeLocales({
      locales: [{ code: 'en', language: 'en-US' }],
    } as any)
    expect(result[0]._hreflang).toBe('en-US')
    expect(result[0]._sitemap).toBe('en-US')
  })

  it('falls back iso to language when language is missing', () => {
    const result = normalizeLocales({
      locales: [{ code: 'en', iso: 'en-US' }],
    } as any)
    expect(result[0].language).toBe('en-US')
    expect(result[0]._hreflang).toBe('en-US')
  })

  it('filters by bundle.onlyLocales when provided', () => {
    const result = normalizeLocales({
      locales: ['en', 'fr', 'es'],
      bundle: { onlyLocales: ['en', 'es'] },
    } as any)
    expect(result).toHaveLength(2)
    expect(result.map(l => l.code)).toEqual(['en', 'es'])
  })

  it('handles onlyLocales as a string', () => {
    const result = normalizeLocales({
      locales: ['en', 'fr'],
      bundle: { onlyLocales: 'en' },
    } as any)
    expect(result).toHaveLength(1)
    expect(result[0].code).toBe('en')
  })

  it('handles empty locales', () => {
    const result = normalizeLocales({} as any)
    expect(result).toEqual([])
  })

  it('merges duplicate locale codes', () => {
    const result = normalizeLocales({
      locales: [
        { code: 'en', name: 'English' },
        { code: 'en', language: 'en-US' },
      ],
    } as any)
    expect(result).toHaveLength(1)
    expect(result[0].language).toBe('en-US')
  })
})

// -------------------------------------------------------------------
// generatePathForI18nPages
// -------------------------------------------------------------------
describe('generatePathForI18nPages', () => {
  const normalisedLocales = [makeLocale('en'), makeLocale('fr'), makeLocale('es')]

  function makeProps(overrides: Partial<StrategyProps> = {}): StrategyProps {
    return {
      localeCode: 'fr',
      pageLocales: '/about',
      nuxtI18nConfig: { strategy: 'prefix_except_default', defaultLocale: 'en' } as any,
      normalisedLocales,
      ...overrides,
    }
  }

  it('prefix_except_default: no prefix for default locale', () => {
    const result = generatePathForI18nPages(makeProps({ localeCode: 'en' }))
    expect(result).toBe('/about')
  })

  it('prefix_except_default: adds prefix for non-default locale', () => {
    const result = generatePathForI18nPages(makeProps({ localeCode: 'fr' }))
    expect(result).toBe('fr/about')
  })

  it('prefix_and_default: no prefix for default locale', () => {
    const result = generatePathForI18nPages(makeProps({
      localeCode: 'en',
      nuxtI18nConfig: { strategy: 'prefix_and_default', defaultLocale: 'en' } as any,
    }))
    expect(result).toBe('/about')
  })

  it('prefix_and_default: adds prefix for non-default locale', () => {
    const result = generatePathForI18nPages(makeProps({
      localeCode: 'fr',
      nuxtI18nConfig: { strategy: 'prefix_and_default', defaultLocale: 'en' } as any,
    }))
    expect(result).toBe('fr/about')
  })

  it('prefix: always adds prefix, even for default locale', () => {
    const result = generatePathForI18nPages(makeProps({
      localeCode: 'en',
      nuxtI18nConfig: { strategy: 'prefix', defaultLocale: 'en' } as any,
    }))
    expect(result).toBe('en/about')
  })

  it('no_prefix: never adds prefix', () => {
    const result = generatePathForI18nPages(makeProps({
      localeCode: 'fr',
      nuxtI18nConfig: { strategy: 'no_prefix', defaultLocale: 'en' } as any,
    }))
    expect(result).toBe('/about')
  })

  it('forcedStrategy overrides nuxtI18nConfig.strategy', () => {
    const result = generatePathForI18nPages(makeProps({
      localeCode: 'en',
      nuxtI18nConfig: { strategy: 'no_prefix', defaultLocale: 'en' } as any,
      forcedStrategy: 'prefix',
    }))
    expect(result).toBe('en/about')
  })

  it('uses domain when locale has one', () => {
    const localesWithDomain = [
      makeLocale('en', { domain: 'en.example.com' }),
      makeLocale('fr', { domain: 'fr.example.com' }),
    ]
    const result = generatePathForI18nPages({
      localeCode: 'fr',
      pageLocales: '/about',
      nuxtI18nConfig: { strategy: 'no_prefix', defaultLocale: 'en' } as any,
      normalisedLocales: localesWithDomain,
    })
    expect(result).toBe('https://fr.example.com/about')
  })
})

// -------------------------------------------------------------------
// splitPathForI18nLocales
// -------------------------------------------------------------------
describe('splitPathForI18nLocales', () => {
  it('returns original path plus locale-prefixed paths', () => {
    const config = makeAutoI18n()
    const result = splitPathForI18nLocales('/about', config)
    // prefix_except_default: only non-default locales get prefixed
    expect(result).toEqual(['/about', '/fr/about', '/es/about'])
  })

  it('returns path as-is when it already has a locale prefix', () => {
    const config = makeAutoI18n()
    const result = splitPathForI18nLocales('/fr/about', config)
    expect(result).toBe('/fr/about')
  })

  it('returns path as-is when it starts with underscore', () => {
    const config = makeAutoI18n()
    const result = splitPathForI18nLocales('/_nuxt/file.js', config)
    expect(result).toBe('/_nuxt/file.js')
  })

  it('returns empty path as-is', () => {
    const config = makeAutoI18n()
    const result = splitPathForI18nLocales('', config)
    expect(result).toBe('')
  })

  it('prefix strategy: includes all locales', () => {
    const config = makeAutoI18n({ strategy: 'prefix' })
    const result = splitPathForI18nLocales('/about', config)
    expect(result).toEqual(['/about', '/en/about', '/fr/about', '/es/about'])
  })

  it('handles exact locale match as path', () => {
    const config = makeAutoI18n()
    const result = splitPathForI18nLocales('/fr', config)
    expect(result).toBe('/fr')
  })
})

// -------------------------------------------------------------------
// mapPathForI18nPages
// -------------------------------------------------------------------
describe('mapPathForI18nPages', () => {
  it('returns false when no pages config', () => {
    const config = makeAutoI18n({ pages: undefined })
    expect(mapPathForI18nPages('/about', config)).toBe(false)
  })

  it('returns false when pages is empty', () => {
    const config = makeAutoI18n({ pages: {} })
    expect(mapPathForI18nPages('/about', config)).toBe(false)
  })

  it('maps a page with custom locale paths', () => {
    const config = makeAutoI18n({
      pages: {
        about: {
          fr: '/a-propos',
          es: '/acerca',
        },
      },
    })
    const result = mapPathForI18nPages('/about', config)
    expect(result).toBeInstanceOf(Array)
    expect(result).toContain('/fr/a-propos')
    expect(result).toContain('/es/acerca')
  })

  it('excludes locales set to false', () => {
    const config = makeAutoI18n({
      pages: {
        about: {
          fr: false,
          es: '/acerca',
        },
      },
    })
    const result = mapPathForI18nPages('/about', config)
    expect(result).toBeInstanceOf(Array)
    const paths = result as string[]
    expect(paths.some(p => p.includes('/fr'))).toBe(false)
    expect(paths).toContain('/es/acerca')
  })

  it('matches by default locale path value', () => {
    const config = makeAutoI18n({
      pages: {
        about: {
          en: '/about-us',
          fr: '/a-propos',
        },
      },
    })
    // when path matches the default locale's custom path
    const result = mapPathForI18nPages('/about-us', config)
    expect(result).toBeInstanceOf(Array)
    expect(result).toContain('/fr/a-propos')
  })

  it('handles paths with leading/trailing slashes', () => {
    const config = makeAutoI18n({
      pages: {
        about: {
          fr: '/a-propos',
        },
      },
    })
    const result = mapPathForI18nPages('/about/', config)
    expect(result).toBeInstanceOf(Array)
  })
})

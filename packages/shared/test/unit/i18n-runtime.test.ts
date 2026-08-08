import type { AutoI18nConfig } from '../../src/i18n'
import type { RuntimeI18nConfig } from '../../src/i18n-runtime'
import { describe, expect, it } from 'vitest'
import { toRuntimeI18nConfig } from '../../src/i18n'
import { computeLocaleAlternates, localePath, resolveLocaleFromRoute } from '../../src/i18n-runtime'

const en = { code: 'en', hreflang: 'en' }
const fr = { code: 'fr', hreflang: 'fr-FR' }
const de = { code: 'de', hreflang: 'de-DE' }

const prefixExceptDefault: RuntimeI18nConfig = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [en, fr],
}

const paths = (route: string, i18n: RuntimeI18nConfig) => computeLocaleAlternates(route, i18n).map(a => a.path)

describe('resolveLocaleFromRoute', () => {
  it('strips the prefix to find the locale', () => {
    expect(resolveLocaleFromRoute('/fr/about', prefixExceptDefault)).toEqual({ locale: 'fr', basePath: '/about' })
  })

  it('falls back to the default locale when unprefixed', () => {
    expect(resolveLocaleFromRoute('/about', prefixExceptDefault)).toEqual({ locale: 'en', basePath: '/about' })
  })

  it('handles a bare locale root', () => {
    expect(resolveLocaleFromRoute('/fr', prefixExceptDefault)).toEqual({ locale: 'fr', basePath: '/' })
  })

  it('never strips a prefix under no_prefix', () => {
    const i18n: RuntimeI18nConfig = { ...prefixExceptDefault, strategy: 'no_prefix' }
    expect(resolveLocaleFromRoute('/fr/about', i18n)).toEqual({ locale: 'en', basePath: '/fr/about' })
  })
})

describe('localePath', () => {
  it('leaves the default locale unprefixed under prefix_except_default', () => {
    expect(localePath('/about', 'en', prefixExceptDefault)).toBe('/about')
    expect(localePath('/about', 'fr', prefixExceptDefault)).toBe('/fr/about')
  })

  it('prefixes every locale under prefix', () => {
    const i18n: RuntimeI18nConfig = { ...prefixExceptDefault, strategy: 'prefix' }
    expect(localePath('/about', 'en', i18n)).toBe('/en/about')
    expect(localePath('/', 'fr', i18n)).toBe('/fr')
  })
})

describe('computeLocaleAlternates', () => {
  it('prefixes when no route table is configured', () => {
    expect(paths('/about', prefixExceptDefault)).toEqual(['/about', '/fr/about'])
  })

  it('resolves a route the table has no entry for', () => {
    const i18n: RuntimeI18nConfig = { ...prefixExceptDefault, pages: { about: { en: '/about', fr: '/a-propos' } } }
    expect(paths('/contact', i18n)).toEqual(['/contact', '/fr/contact'])
  })
})

describe('computeLocaleAlternates with translated routes', () => {
  const translated: RuntimeI18nConfig = {
    ...prefixExceptDefault,
    pages: {
      'about': { en: '/about', fr: '/a-propos' },
      'blog': { en: '/blog', fr: '/journal' },
      'blog-slug': { en: '/blog/[slug]', fr: '/journal/[slug]' },
      'docs-path': { en: '/docs/[...path]', fr: '/documentation/[...path]' },
      'legal': { en: '/legal', fr: false },
    },
  }

  it('uses the translated slug instead of prefixing the default one', () => {
    expect(computeLocaleAlternates('/about', translated)).toEqual([
      { code: 'en', hreflang: 'en', path: '/about' },
      { code: 'fr', hreflang: 'fr-FR', path: '/fr/a-propos' },
    ])
  })

  it('resolves back from a translated route to the default one', () => {
    expect(paths('/fr/a-propos', translated)).toEqual(['/about', '/fr/a-propos'])
  })

  it('carries dynamic params across locales in both directions', () => {
    expect(paths('/blog/hello-world', translated)).toEqual(['/blog/hello-world', '/fr/journal/hello-world'])
    expect(paths('/fr/journal/hello-world', translated)).toEqual(['/blog/hello-world', '/fr/journal/hello-world'])
  })

  it('carries catch-all params across locales', () => {
    expect(paths('/docs/guide/getting-started', translated))
      .toEqual(['/docs/guide/getting-started', '/fr/documentation/guide/getting-started'])
  })

  it('carries optional params across locales', () => {
    const optional: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: { 'blog-slug': { en: '/blog/[[slug]]', fr: '/journal/[[slug]]' } },
    }
    expect(paths('/blog/hello', optional)).toEqual(['/blog/hello', '/fr/journal/hello'])
    expect(paths('/blog', optional)).toEqual(['/blog', '/fr/journal'])
  })

  it('omits locales the page is disabled for', () => {
    expect(computeLocaleAlternates('/legal', translated)).toEqual([
      { code: 'en', hreflang: 'en', path: '/legal' },
    ])
  })

  it('does not confuse a listing route with its detail route', () => {
    expect(paths('/blog', translated)).toEqual(['/blog', '/fr/journal'])
  })

  it('prefers a static entry over a dynamic one declared before it', () => {
    const shadowed: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        slug: { en: '/[slug]', fr: '/[slug]' },
        about: { en: '/about', fr: '/a-propos' },
      },
    }
    expect(paths('/about', shadowed)).toEqual(['/about', '/fr/a-propos'])
  })

  it('prefers a static entry over a catch-all declared before it', () => {
    const shadowed: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        path: { en: '/[...path]', fr: '/[...path]' },
        about: { en: '/about', fr: '/a-propos' },
      },
    }
    expect(paths('/about', shadowed)).toEqual(['/about', '/fr/a-propos'])
  })

  it('prefers a dynamic segment over a catch-all at the same depth', () => {
    const ranked: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        'docs-path': { en: '/docs/[...path]', fr: '/documentation/[...path]' },
        'docs-slug': { en: '/docs/[slug]', fr: '/doc/[slug]' },
      },
    }
    expect(paths('/docs/intro', ranked)).toEqual(['/docs/intro', '/fr/doc/intro'])
    expect(paths('/docs/guide/intro', ranked)).toEqual(['/docs/guide/intro', '/fr/documentation/guide/intro'])
  })

  it('keeps translations for the locales an entry does name', () => {
    const partial: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      locales: [en, fr, de],
      pages: { about: { en: '/about', fr: '/a-propos' } },
    }
    // `de` is untranslated, so it keeps the default locale's path rather than
    // the requested `/a-propos`, which exists only under `fr`.
    expect(paths('/fr/a-propos', partial)).toEqual(['/about', '/fr/a-propos', '/de/about'])
  })

  it('falls back to prefixing when an entry names no default locale', () => {
    const partial: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: { about: { fr: '/a-propos' } },
    }
    expect(paths('/fr/a-propos', partial)).toEqual(['/a-propos', '/fr/a-propos'])
  })

  it('prefixes every locale under the prefix strategy', () => {
    const prefixed: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      strategy: 'prefix',
      pages: { about: { en: '/about', fr: '/a-propos' } },
    }
    expect(paths('/en/about', prefixed)).toEqual(['/en/about', '/fr/a-propos'])
  })

  it('ignores the table under no_prefix, where each page has one URL', () => {
    const single: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      strategy: 'no_prefix',
      pages: { about: { en: '/about', fr: '/a-propos' } },
    }
    expect(paths('/about', single)).toEqual(['/about', '/about'])
  })
})

describe('toRuntimeI18nConfig', () => {
  const auto: AutoI18nConfig = {
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', _hreflang: 'en-US', _sitemap: 'en-US' },
      { code: 'fr', _hreflang: 'fr-FR', _sitemap: 'fr-FR' },
    ],
  }

  it('carries hreflang off the normalised locale', () => {
    expect(toRuntimeI18nConfig(auto).locales).toEqual([
      { code: 'en', hreflang: 'en-US', name: undefined, nativeName: undefined },
      { code: 'fr', hreflang: 'fr-FR', name: undefined, nativeName: undefined },
    ])
  })

  it('omits pages when the route table is empty', () => {
    expect(toRuntimeI18nConfig(auto)).not.toHaveProperty('pages')
    expect(toRuntimeI18nConfig({ ...auto, pages: {} })).not.toHaveProperty('pages')
  })

  it('carries the route table through when present', () => {
    const pages = { about: { en: '/about', fr: '/a-propos' } }
    expect(toRuntimeI18nConfig({ ...auto, pages }).pages).toEqual(pages)
  })
})

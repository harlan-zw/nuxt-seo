import type { AutoI18nConfig } from '../../src/i18n'
import type { RuntimeI18nConfig } from '../../src/i18n-runtime'
import { describe, expect, it } from 'vitest'
import { toRuntimeI18nConfig } from '../../src/i18n'
import { computeLocaleAlternates, localePath, resolveLocaleAlternates, resolveLocaleFromRoute } from '../../src/i18n-runtime'

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

  it('resolves prefixes without treating query or hash text as route segments', () => {
    expect(resolveLocaleFromRoute('/fr/about?preview=true#intro', prefixExceptDefault))
      .toEqual({ locale: 'fr', basePath: '/about?preview=true#intro' })
    expect(resolveLocaleFromRoute('/fr?preview=true', prefixExceptDefault))
      .toEqual({ locale: 'fr', basePath: '/?preview=true' })
  })

  it('never strips a prefix under no_prefix', () => {
    const i18n: RuntimeI18nConfig = { ...prefixExceptDefault, strategy: 'no_prefix' }
    expect(resolveLocaleFromRoute('/fr/about', i18n)).toEqual({ locale: 'en', basePath: '/fr/about' })
  })

  it('resolves no-prefix locales from their request host', () => {
    const i18n: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      strategy: 'no_prefix',
      differentDomains: true,
      locales: [
        { ...en, domain: 'https://example.com' },
        { ...fr, domain: 'fr.example.com' },
      ],
    }
    expect(resolveLocaleFromRoute('/about', i18n, { host: 'fr.example.com' }))
      .toEqual({ locale: 'fr', basePath: '/about' })
  })
})

describe('localePath', () => {
  it('leaves the default locale unprefixed under prefix_except_default', () => {
    expect(localePath('/about', 'en', prefixExceptDefault)).toBe('/about')
    expect(localePath('/about', 'fr', prefixExceptDefault)).toBe('/fr/about')
  })

  it('normalizes paths without a leading slash', () => {
    expect(localePath('about', 'fr', prefixExceptDefault)).toBe('/fr/about')
  })

  it('prefixes every locale under prefix', () => {
    const i18n: RuntimeI18nConfig = { ...prefixExceptDefault, strategy: 'prefix' }
    expect(localePath('/about', 'en', i18n)).toBe('/en/about')
    expect(localePath('/', 'fr', i18n)).toBe('/fr')
  })

  it('leaves a domain default locale unprefixed', () => {
    const i18n: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      multiDomainLocales: true,
      locales: [
        { ...en, domains: ['example.com'] },
        { ...fr, domains: ['fr.example.com'], defaultForDomains: ['fr.example.com'] },
      ],
    }
    expect(localePath('/about', 'fr', i18n, { host: 'fr.example.com' })).toBe('/about')
  })
})

describe('computeLocaleAlternates', () => {
  it('reports whether translated pages or strategy arithmetic resolved the route', () => {
    expect(resolveLocaleAlternates('/about', prefixExceptDefault)._tag).toBe('strategy')
    expect(resolveLocaleAlternates('/about', {
      ...prefixExceptDefault,
      pages: {
        about: { en: '/about', fr: '/a-propos' },
      },
    })._tag).toBe('pages')
  })

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

  it('translates the pathname while preserving query and hash suffixes', () => {
    expect(paths('/about?preview=true#intro', translated))
      .toEqual(['/about?preview=true#intro', '/fr/a-propos?preview=true#intro'])
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

  it('prefers an exact route over an optional sibling', () => {
    const shadowed: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        'blog-slug': { en: '/blog/[[slug]]', fr: '/journal/[[slug]]' },
        'blog': { en: '/blog', fr: '/articles' },
      },
    }
    expect(paths('/blog', shadowed)).toEqual(['/blog', '/fr/articles'])
  })

  it('matches params embedded in static segments', () => {
    const embedded: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        'archive-entry': { en: '/archive/[year]-[slug]', fr: '/archives/[slug]-[year]' },
      },
    }
    expect(paths('/archive/2026-release-notes', embedded))
      .toEqual(['/archive/2026-release-notes', '/fr/archives/release-notes-2026'])
  })

  it('backtracks over an omitted optional segment', () => {
    const optional: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        editor: { en: '/articles/[[slug]]/edit', fr: '/articles/[[slug]]/modifier' },
      },
    }
    expect(paths('/articles/edit', optional)).toEqual(['/articles/edit', '/fr/articles/modifier'])
  })

  it('supports Vue Router catch-all syntax', () => {
    const catchAll: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: {
        docs: { en: '/docs/:path(.*)*', fr: '/documentation/:path(.*)*' },
      },
    }
    expect(paths('/docs/guide/getting-started', catchAll))
      .toEqual(['/docs/guide/getting-started', '/fr/documentation/guide/getting-started'])
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

  it('omits unknown locale paths when an entry names no default locale', () => {
    const partial: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      pages: { about: { fr: '/a-propos' } },
    }
    expect(paths('/fr/a-propos', partial)).toEqual(['/fr/a-propos'])
  })

  it('exposes locale domains with alternates', () => {
    const domains: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      strategy: 'no_prefix',
      differentDomains: true,
      locales: [
        { ...en, domain: 'example.com' },
        { ...fr, domain: 'fr.example.com' },
      ],
    }
    expect(computeLocaleAlternates('/about', domains)).toEqual([
      { code: 'en', hreflang: 'en', path: '/about', domain: 'example.com' },
      { code: 'fr', hreflang: 'fr-FR', path: '/about', domain: 'fr.example.com' },
    ])
  })

  it('uses each locale default domain as its canonical alternate domain', () => {
    const domains: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      strategy: 'no_prefix',
      multiDomainLocales: true,
      locales: [
        { ...en, domains: ['example.test', 'example.com'], defaultForDomains: ['example.com'] },
        { ...fr, domains: ['example.test'], defaultForDomains: ['example.test'] },
      ],
    }
    expect(computeLocaleAlternates('/about', domains, { host: 'example.test' })).toEqual([
      { code: 'en', hreflang: 'en', path: '/about', domain: 'example.com' },
      { code: 'fr', hreflang: 'fr-FR', path: '/about', domain: 'example.test' },
    ])
  })

  it('translates routes across locale domains', () => {
    const domains: RuntimeI18nConfig = {
      ...prefixExceptDefault,
      differentDomains: true,
      locales: [
        { ...en, domain: 'example.com' },
        { ...fr, domain: 'fr.example.com' },
      ],
      pages: { about: { en: '/about', fr: '/a-propos' } },
    }
    expect(computeLocaleAlternates('/a-propos', domains, { host: 'fr.example.com' })).toEqual([
      { code: 'en', hreflang: 'en', path: '/about', domain: 'example.com' },
      { code: 'fr', hreflang: 'fr-FR', path: '/a-propos', domain: 'fr.example.com' },
    ])
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
    expect(computeLocaleAlternates('/about', single, { locale: 'en' }).map(alternate => alternate.path))
      .toEqual(['/about', '/a-propos'])
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

  it('carries serializable domain locale metadata through', () => {
    const config = toRuntimeI18nConfig({
      ...auto,
      differentDomains: true,
      multiDomainLocales: true,
      locales: [
        {
          code: 'en',
          _hreflang: 'en-US',
          _sitemap: 'en-US',
          language: 'en-US',
          domain: 'example.com',
          domains: ['example.com', 'example.test'],
          defaultForDomains: ['example.com'],
        },
      ],
    })
    expect(config).toMatchObject({
      differentDomains: true,
      multiDomainLocales: true,
      locales: [{
        code: 'en',
        hreflang: 'en-US',
        language: 'en-US',
        domain: 'example.com',
        domains: ['example.com', 'example.test'],
        defaultForDomains: ['example.com'],
      }],
    })
  })
})

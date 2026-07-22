import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

// Prerendering writes llms.txt / llms-full.txt directly to the public dir as each
// page is generated, independent of the runtime database. The static files are
// then served, so this exercises ai-ready's build-time page indexing alongside
// the rest of the @nuxtjs/seo stack. Titles/descriptions come from site config
// and seo-utils title templating; headings are mdream-normalised (`h1.`).
await setup({
  rootDir: resolve('../fixtures/basic'),
  build: true,
  server: true,
  nuxtConfig: {
    modules: ['nuxt-skew-protection', 'nuxt-ai-ready'],
    site: {
      url: 'https://local.nuxtseo.com',
    },
    sitemap: {
      credits: false,
    },
    nitro: {
      prerender: {
        crawlLinks: true,
        routes: ['/', '/about'],
        failOnError: false,
      },
    },
  },
})

describe('standalone modules (prerendered)', () => {
  it('ai-ready generates the expected llms.txt', async () => {
    const txt = await $fetch('/llms.txt', { responseType: 'text' }) as string

    // Header sourced from site config
    expect(txt).toContain('# @nuxtjs/seo')
    expect(txt).toContain('> Fully equipped Technical SEO for busy Nuxters.')
    expect(txt).toContain('Canonical Origin: https://local.nuxtseo.com')

    // LLM Resources section links out to the full content + robots
    expect(txt).toContain('## LLM Resources')
    expect(txt).toContain('- [Full Content](https://local.nuxtseo.com/llms-full.txt)')
    expect(txt).toContain('- [robots.txt](https://local.nuxtseo.com/robots.txt)')

    // Pages section: one entry per prerendered route, title templated by seo-utils
    expect(txt).toContain('## Pages')
    expect(txt).toContain('- [@nuxtjs&#x2F;seo](/): Fully equipped Technical SEO for busy Nuxters.')
    expect(txt).toContain('- [About | @nuxtjs&#x2F;seo](/about): Fully equipped Technical SEO for busy Nuxters.')
  })

  it('ai-ready prerenders full page content into llms-full.txt', async () => {
    const txt = await $fetch('/llms-full.txt', { responseType: 'text' }) as string

    // Same header as llms.txt
    expect(txt).toContain('# @nuxtjs/seo')
    expect(txt).toContain('Canonical Origin: https://local.nuxtseo.com')
    expect(txt).toContain('## Pages')

    // Full per-page sections with source, description and the page's markdown
    // body. Streaming order depends on prerender completion, so assert each
    // block independently rather than the whole document.
    expect(txt).toContain([
      '### @nuxtjs&#x2F;seo',
      '',
      'Source: https://local.nuxtseo.com/',
      'Description: Fully equipped Technical SEO for busy Nuxters.',
      '',
      'h1. home',
    ].join('\n'))

    expect(txt).toContain([
      '### About | @nuxtjs&#x2F;seo',
      '',
      'Source: https://local.nuxtseo.com/about',
      'Description: Fully equipped Technical SEO for busy Nuxters.',
      '',
      'h1. about',
    ].join('\n'))
  })

  it('ai-ready emits static .md twins for prerendered pages', async () => {
    const aboutMd = await $fetch('/about.md', { responseType: 'text' }) as string
    expect(aboutMd).toContain('about')
  })

  it('core SEO output is still generated under prerendering', async () => {
    const robots = await $fetch('/robots.txt', { responseType: 'text' }) as string
    expect(robots).toContain('User-agent')

    const sitemap = await $fetch('/sitemap.xml', { responseType: 'text' }) as string
    expect(sitemap).toContain('<urlset')
  })
})

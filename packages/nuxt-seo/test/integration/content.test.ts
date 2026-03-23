import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { extractSeoHead } from '../utils'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

await setup({
  rootDir: resolve('../fixtures/content'),
  server: true,
  nuxtConfig: {
    site: {
      url: 'https://nuxtseo.com',
    },
    sitemap: {
      credits: false,
    },
  },
})

describe('content', () => {
  it('seo utils - index page with frontmatter', async () => {
    const html = await $fetch('/') as string
    const head = extractSeoHead(html)
    expect(head).toContain('<title>')
    expect(head).toContain('og:title')
    expect(head).toContain('og:description')
    expect(head).toContain('canonical')
  })

  it('seo utils - content page /foo', async () => {
    const html = await $fetch('/foo') as string
    const head = extractSeoHead(html)
    expect(head).toContain('og:url')
    expect(head).toContain('canonical')
  })

  it('sitemap includes content pages', async () => {
    const xml = await $fetch('/sitemap.xml') as string
    expect(xml).toContain('https://nuxtseo.com/')
    expect(xml).toContain('https://nuxtseo.com/foo')
  })

  it('sitemap includes partial content pages', async () => {
    const xml = await $fetch('/sitemap.xml') as string
    // _partial.md is included since it has no underscore prefix convention exclusion in @nuxt/content v3
    expect(xml).toContain('https://nuxtseo.com/_partial')
  })

  it('robots.txt is generated', async () => {
    const txt = await $fetch('/robots.txt') as string
    expect(txt).toContain('User-agent: *')
    expect(txt).toContain('Sitemap:')
  })

  it('schema.org on index', async () => {
    const html = await $fetch('/') as string
    const match = html.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)
    expect(match).toBeTruthy()
    const schemaOrg = JSON.parse(match![1])
    expect(schemaOrg['@context']).toBe('https://schema.org')
    expect(schemaOrg['@graph']).toBeInstanceOf(Array)
    const webpage = schemaOrg['@graph'].find((n: any) => n['@type'] === 'WebPage')
    expect(webpage).toBeTruthy()
  })

  it('nested content posts/bar has sitemap metadata', async () => {
    const xml = await $fetch('/sitemap.xml') as string
    // content fixture has sitemap.loc override that maps to /blog/posts/bar
    expect(xml).toContain('posts/bar')
    expect(xml).toContain('<lastmod>2021-10-20</lastmod>')
  })
})

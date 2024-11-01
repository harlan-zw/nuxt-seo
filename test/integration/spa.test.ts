import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { extractSeoHead } from '../utils'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    ssr: false,
    site: {
      url: 'https://local.nuxtseo.com',
    },
    sitemap: {
      credits: false, // breaks snapshot
    },
  },
})

describe('spa', () => {
  it('seo utils - default', async () => {
    // extract the <head>
    const html = await $fetch('/')
    // TODO needs some work
    expect(extractSeoHead(html)).toMatchInlineSnapshot(`
      "<meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta property="og:type" content="website">"
    `)
  })
  it('sitemap - default', async () => {
    // extract the <head>
    const xml = await $fetch('/sitemap.xml')
    expect(xml).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet type="text/xsl" href="/__sitemap__/style.xsl"?>
      <urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <url>
              <loc>https://local.nuxtseo.com/</loc>
          </url>
          <url>
              <loc>https://local.nuxtseo.com/about</loc>
          </url>
      </urlset>"
    `)
  })
  it('robots - default', async () => {
    // extract the <head>
    const txt = await $fetch('/robots.txt')
    expect(txt).toMatchInlineSnapshot(`
      "# START nuxt-robots (indexable)
      User-agent: *
      Disallow:

      Sitemap: https://local.nuxtseo.com/sitemap.xml
      # END nuxt-robots"
    `)
  })
  it('schema.org - default', async () => {
    // extract the <head>
    const txt = await $fetch('/')
    // extract schema.org from <script type="application/ld+json" id="schema-org-graph"></script>
    const schemaOrg = txt.match(/<script type="application\/ld\+json" id="schema-org-graph">([\s\S]*)<\/script>/)?.[1]
    expect(schemaOrg).toBeUndefined()
  })
})

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
    site: {
      trailingSlash: true,
    },
  },
})

describe('trailing slash', () => {
  it('seo utils - default', async () => {
    // extract the <head>
    const html = await $fetch('/about')
    expect(extractSeoHead(html)).toMatchInlineSnapshot(`
      "<meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta property="og:type" content="website">
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
      <title>About | @nuxtjs&#x2F;seo</title>
      <meta name="description" content="The all-in-one SEO layer for Nuxt 3.">
      <meta name="twitter:card" content="summary_large_image">
      <meta property="og:title" data-infer="true" content="About | @nuxtjs/seo">
      <meta property="og:description" data-infer="true" content="The all-in-one SEO layer for Nuxt 3.">
      <link rel="canonical" href="https://local.nuxtseo.com/about/">
      <meta property="og:url" content="https://local.nuxtseo.com/about/">
      <meta property="og:site_name" content="@nuxtjs/seo">"
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
              <loc>https://local.nuxtseo.com/about/</loc>
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
    const txt = await $fetch('/about')
    // extract schema.org from <script type="application/ld+json" id="schema-org-graph"></script>
    const schemaOrg = JSON.parse(txt.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)[1])
    expect(schemaOrg).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://local.nuxtseo.com/#website",
            "@type": "WebSite",
            "description": "The all-in-one SEO layer for Nuxt 3.",
            "name": "@nuxtjs/seo",
            "url": "https://local.nuxtseo.com/",
          },
          {
            "@id": "https://local.nuxtseo.com/about/#webpage",
            "@type": "WebPage",
            "description": "The all-in-one SEO layer for Nuxt 3.",
            "isPartOf": {
              "@id": "https://local.nuxtseo.com/#website",
            },
            "name": "About",
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://local.nuxtseo.com/about/",
                ],
              },
            ],
            "url": "https://local.nuxtseo.com/about/",
          },
        ],
      }
    `)
  })
})

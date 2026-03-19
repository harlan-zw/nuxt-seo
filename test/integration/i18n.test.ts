import { createResolver } from '@nuxt/kit'
import { $fetch, setup, url } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { extractOgImageUrl, extractSeoHead } from '../utils'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

await setup({
  rootDir: resolve('../fixtures/i18n'),
  server: true,
  nuxtConfig: {
    site: {
      url: 'https://local.nuxtseo.com',
    },
    sitemap: {
      credits: false, // breaks snapshot
    },
  },
})

describe('i18n', () => {
  it('seo utils - default - en', async () => {
    // extract the <head>
    const html = await $fetch('/') as string
    // TODO needs some work
    expect(extractSeoHead(html)).toMatchInlineSnapshot(`
      "<meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta property="og:image" content="https://nuxtseo.com/_og/d/default.png?_v=test">
      <meta property="og:image:type" content="image/png">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:image" content="https://nuxtseo.com/_og/d/default.png?_v=test">
      <meta name="twitter:image:src" content="https://nuxtseo.com/_og/d/default.png?_v=test">
      <meta property="og:image:width" content="1200">
      <meta name="twitter:image:width" content="1200">
      <meta property="og:image:height" content="600">
      <meta name="twitter:image:height" content="600">
      <meta property="og:type" content="website">
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
      <title>@nuxtjs&#x2F;seo</title>
      <meta name="description" content="en description">
      <meta property="og:title" data-infer="" content="@nuxtjs/seo">
      <meta property="og:description" data-infer="" content="en description">
      <link rel="canonical" href="https://nuxtseo.com/">
      <meta property="og:url" content="https://nuxtseo.com/">
      <meta property="og:locale" content="en_US">
      <meta property="og:site_name" content="@nuxtjs/seo">"
    `)
  })
  it('seo utils - default - fr', async () => {
    // extract the <head>
    const html = await $fetch('/fr') as string
    // TODO needs some work
    expect(extractSeoHead(html)).toMatchInlineSnapshot(`
      "<meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta property="og:image" content="https://nuxtseo.com/_og/d/p_Ii9mciI.png?_v=test">
      <meta property="og:image:type" content="image/png">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:image" content="https://nuxtseo.com/_og/d/p_Ii9mciI.png?_v=test">
      <meta name="twitter:image:src" content="https://nuxtseo.com/_og/d/p_Ii9mciI.png?_v=test">
      <meta property="og:image:width" content="1200">
      <meta name="twitter:image:width" content="1200">
      <meta property="og:image:height" content="600">
      <meta name="twitter:image:height" content="600">
      <meta property="og:type" content="website">
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
      <title>Fr | fr name</title>
      <meta name="description" content="fr description">
      <meta property="og:title" data-infer="" content="Fr | fr name">
      <meta property="og:description" data-infer="" content="fr description">
      <link rel="canonical" href="https://nuxtseo.com/fr">
      <meta property="og:url" content="https://nuxtseo.com/fr">
      <meta property="og:locale" content="fr_FR">
      <meta property="og:site_name" content="fr name">"
    `)
  })
  it('sitemap - default', async () => {
    // extract the <head>
    const xml = await $fetch('/sitemap.xml') as string
    expect(xml).toMatchInlineSnapshot(`
      "<?xml version="1.0" encoding="UTF-8"?>
      <?xml-stylesheet type="text/xsl" href="/__sitemap__/style.xsl"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
          <sitemap>
              <loc>https://nuxtseo.com/__sitemap__/en-US.xml</loc>
          </sitemap>
          <sitemap>
              <loc>https://nuxtseo.com/__sitemap__/es-ES.xml</loc>
          </sitemap>
          <sitemap>
              <loc>https://nuxtseo.com/__sitemap__/fr-FR.xml</loc>
          </sitemap>
      </sitemapindex>"
    `)
  })
  it('robots - default', async () => {
    // extract the <head>
    const txt = await $fetch('/robots.txt') as string
    expect(txt.split('\n').map((s: string) => s.trim())).toMatchInlineSnapshot(`
      [
        "# START nuxt-robots (indexable)",
        "User-agent: *",
        "Disallow:",
        "",
        "Sitemap: https://nuxtseo.com/sitemap_index.xml",
        "# END nuxt-robots",
      ]
    `)
  })
  it('og-image - url', async () => {
    const html = await $fetch('/') as string
    const ogImageUrl = extractOgImageUrl(html)
    expect(ogImageUrl).toMatchInlineSnapshot(`"https://nuxtseo.com/_og/d/default.png?_v=test"`)
  })
  it('og-image - image snapshot', async () => {
    const image = await fetch(url('/_og/d/default.png')).then(r => r.arrayBuffer())
    expect(Buffer.from(image)).toMatchImageSnapshot()
  })
  it('schema.org - default', async () => {
    // extract the <head>
    const txt = await $fetch('/') as string
    // extract schema.org from <script type="application/ld+json" id="schema-org-graph"></script>
    const schemaOrg = JSON.parse(txt.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)?.[1] || '{}')
    expect(schemaOrg).toMatchInlineSnapshot(`
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@id": "https://nuxtseo.com/#website",
            "@type": "WebSite",
            "description": "en description",
            "inLanguage": "en-US",
            "name": "@nuxtjs/seo",
            "url": "https://nuxtseo.com/",
            "workTranslation": [
              {
                "@id": "https://nuxtseo.com/#website",
              },
              {
                "@id": "https://nuxtseo.com/es#website",
              },
              {
                "@id": "https://nuxtseo.com/fr#website",
              },
            ],
          },
          {
            "@id": "https://nuxtseo.com/#webpage",
            "@type": "WebPage",
            "breadcrumb": {
              "@id": "https://nuxtseo.com/#breadcrumb",
            },
            "description": "en description",
            "isPartOf": {
              "@id": "https://nuxtseo.com/#website",
            },
            "potentialAction": [
              {
                "@type": "ReadAction",
                "target": [
                  "https://nuxtseo.com/",
                ],
              },
            ],
            "url": "https://nuxtseo.com/",
          },
          {
            "@id": "https://nuxtseo.com/#breadcrumb",
            "@type": "BreadcrumbList",
            "id": "#breadcrumb",
            "itemListElement": [
              {
                "@type": "ListItem",
                "item": "https://nuxtseo.com/",
                "name": "Prepend",
                "position": 1,
              },
              {
                "@type": "ListItem",
                "item": "https://nuxtseo.com/en",
                "name": "En",
                "position": 2,
              },
              {
                "@type": "ListItem",
                "item": "https://nuxtseo.com/content",
                "name": "Override",
                "position": 3,
              },
              {
                "@type": "ListItem",
                "item": "https://nuxtseo.com/en/blog/my-post",
                "name": "My Post",
                "position": 4,
              },
              {
                "@type": "ListItem",
                "item": "https://nuxtseo.com/content",
                "name": "Append",
                "position": 5,
              },
            ],
          },
        ],
      }
    `)
  })
})

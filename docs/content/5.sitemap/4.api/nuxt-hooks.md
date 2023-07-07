---
title: Nuxt Hooks
description: Learn how to use Nuxt Hooks to customize your sitemap entries.
---

Nuxt hooks can be added to modify the output of your sitemaps when prerendering. 

If you need to modify the behavior at runtime, use [Nitro Hooks](/sitemap/api/nitro-hooks) instead.

## `sitemap:resolved`

**Type:** `async (ctx: { urls: SitemapConfig; sitemapName: string }) => void | Promise<void>`

Triggered once the final structure of the XML is generated, provides the URLs as objects.

```ts [nuxt.config]
export default defineNuxtConfig({
  hooks: {
    'sitemap:resolved': function (ctx) {
      // single sitemap example - just add the url directly
      ctx.urls.push({
        loc: '/my-secret-url',
        changefreq: 'daily',
        priority: 0.8,
      })
      // multi sitemap example - filter for a sitemap name
      if (ctx.sitemapName === 'posts') {
        ctx.urls.push({
          loc: '/posts/my-post',
          changefreq: 'daily',
          priority: 0.8,
        })
      }
    }
  },
})
```

## `sitemap:output`

**Type:** `async (ctx: { sitemap: string; sitemapName: string }) => void | Promise<void>`
**Default:** `undefined`

Triggered before the sitemap is sent to the client.
It provides the sitemap as a XML string.

```ts [nuxt.config]
export default defineNuxtConfig({
  hooks: {
    'sitemap:output': function (ctx) {
      // append a comment credit to the footer of the xml
      ctx.sitemap = `${ctx.sitemap}\n<!-- Sitemap output test-->`
    }
  },
})
```




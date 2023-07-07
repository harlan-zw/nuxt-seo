---
title: Nuxt Hooks
description: Learn how to use Nuxt Hooks to customize your sitemap entries.
---

## `site-config:resolve`

**Type:** `async (ctx: { urls: SitemapConfig; sitemapName: string }) => void | Promise<void>`

Last chance to modify the build time site config.

```ts
export default defineNuxtConfig({
  hooks: {
    'site-config:resolve': (siteConfig) => {
      if (process.env.FOO)
        siteConfig.name = 'Bar'
    },
  },
})
```




---
title: Nuxt Hooks
description: Learn how to use Nuxt Hooks to customize your site config.
---

## `site-config:resolve`

**Type:** `async (ctx: SiteConfig) => void | Promise<void>`

Modify the build time site config after it has been resolved.

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

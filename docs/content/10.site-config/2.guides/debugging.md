---
title: Debugging
description: Learn how to debug your site config.
---

Nuxt Site Config comes with a Nuxt DevTools integration. The easiest way to debug is to open your DevTools
and navigate to the Site Config tab.

If you'd like to debug outside of development, you will need to enable the debug mode.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  site: {
    debug: true,
  },
})
```

## Debugging Runtime

Visit the endpoint `/__site-config__/debug.json` to see the current site config debug output.

## Debugging Build Time

A static file `/__site-config__/debug.json` is generated at build time.

You can view this file to see the build time site config debug output.

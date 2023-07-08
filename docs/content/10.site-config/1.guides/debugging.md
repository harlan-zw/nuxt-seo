---
title: Debugging
description: Learn how to debug your site config.
---

Enable debugging through the nuxt.config.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  site: {
    debug: true,
  },
})
```

Now visit the endpoint `/api/__site-config__/debug` within development.

## Build Time

With `debug` enabled a file will be output at `/api/__site-config__/debug` with the build time site config.

---
title: Nitro Hooks
description: Learn how to use Nitro Hooks to customize your site config.
---

## `site-config:init`

**Type:**
```ts
export interface HookSiteConfigInitContext {
  event: H3Event
  siteConfig: SiteConfigStack
}
```

Modify site config after it's being initialized.

```ts [server/plugins/site-config.ts]
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ event, siteConfig }) => {
    const origin = useNitroOrigin(event)
    if (origin.startsWith('fr.')) {
      siteConfig.push({
        _context: 'french nitro plugin', // helps you debug
        name: 'Mon Site',
        url: 'https://fr.example.com',
      })
    }
  })
})
```

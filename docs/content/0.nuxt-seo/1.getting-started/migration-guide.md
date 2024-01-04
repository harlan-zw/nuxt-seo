---
title: Migration Guide
description: Migrate from the nuxt-seo-kit package v1 to the new v2 @nuxtseo/module.
---

## Support

If you get stuck with the migration or have post-migration bugs, please get in touch!

- [Jump in the Discord](https://discord.com/invite/5jDAMswWwX)
- [Make a GitHub issue](https://github.com/harlan-zw/nuxt-seo-kit/issues)
- [Provide feedback](https://github.com/harlan-zw/nuxt-seo-kit/discussions/108)

## Module Rename

With v2 the module name and scope is clarified with the rename to Nuxt SEO.

- 1.* - Nuxt SEO Kit `nuxt-seo-kit` (Nuxt Layer)
- 2.x - Nuxt SEO `@nuxtseo/module` (Nuxt Module)

The v2 at its core allows you to use all SEO modules at runtime, prerendering is no longer required. It also
comes with improved i18n compatibility.

It has been renamed to provide a better base for growing out the Nuxt SEO ecosystem as well as to make the layer -> module
change more obvious.

::code-group

```sh [pnpm]
# remove nuxt-seo-kit
pnpm remove nuxt-seo-kit && pnpm i -D @nuxtseo/module
```

```bash [yarn]
yarn remove nuxt-seo-kit && yarn add -D @nuxtseo/module
```

```bash [npm]
npm remove nuxt-seo-kit && npm install -D @nuxtseo/module
```

::

```diff [nuxt.config.ts]
export default defineNuxtConfig({
-  extends: ['nuxt-seo-kit'],
  modules: [
+  '@nuxtseo/module',
  ]
})
```

## Breaking Changes

### `<SeoKit>`, `useSeoKit()` Removed

These APIs set up all the default meta and module configuration for you.

In v2, they are no longer needed as functionality has been moved to a plugin.

```diff
<template>
-  <SeoKit />
</template>
```

```diff
<script setup>
-  useSeoKit()
</script>
```

If you'd like to opt-out of the these v2 configurations, you can set [automaticDefaults](/nuxt-seo/api/config#automaticdefaults) to `false`.

## Site Config Changes

In v1, site config was set through runtime config. In v2, we have a dedicated module with helpers for handling
this config called [nuxt-site-config](/site-config/getting-started/background).

The move to a module is to allow greater flexible in changing site configuration at runtime.

If you were specifying any static config in `runtimeConfig` previously, it's now recommended to move this to the `site` key.

::code-group

```ts [v1]
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      // you can remove environment variables, they'll be set automatically
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      siteName: 'My App'
    }
  }
})
```

```ts [v2]
export default defineNuxtConfig({
  site: {
    name: 'My App'
  }
})
```

::

When updating your config:
- All keys are without the `site` prefix
- The `language` config has been renamed to `defaultLocale`

The behavior for environment variables hasn't changed, it's recommended to read [how site config works](/site-config/getting-started/how-it-works) for
more advanced configuration.

## Prerendering Changes

In v1, it was required to prerender all pages, to ensure this happened your `nuxt.config` was modified.

In v2, everything can be generated at runtime and the prerendering changes are no longer provided.

If you'd like to keep the prerendering changes, you can add this to your nuxt.config.

```ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
      ],
    },
  },
})
```

## Module Upgrades

### Nuxt Simple Robots

Upgraded from v1 to v3:
- [v2 release notes](https://github.com/harlan-zw/nuxt-simple-robots/releases/tag/v2.0.0)
- [v3 release notes](/robots/releases/v3)

No breaking changes.

### Nuxt Simple Sitemap

Upgraded from v1 to v3:
- [v2 release notes](https://github.com/harlan-zw/nuxt-simple-sitemap/releases/tag/v2.0.0)
- [v3 release notes](/sitemap/releases/v3)

No breaking changes.

### Nuxt Schema.org

Upgraded from v2 to v3:
- [v3 release notes](/schema-org/releases/v3)

No breaking changes.

### Nuxt OG Image

Upgraded from v1 to v2:
- [v2 release notes](/og-image/releases/v2)

The following options have been removed from nuxt.config `ogImage`:

- `host`, `siteUrl` - see [prerendering-images](/og-image/guides/prerendering-images) for details.
- `forcePrerender` - removed, not needed
- `satoriProvider` - removed use `runtimeSatori`
- `browserProvider` - removed use `runtimeBrowser`
- `experimentalInlineWasm` - removed, this is now automatic based on environment
- `experimentalRuntimeBrowser` - removed, this is now automatic based on environment

The following options have been deprecated from the `defineOgImage` options:

- `static` - use `cache` instead

If you were referencing the old default template, you will need to update it.

- `OgImageBasic` - remove the property, allow the fallback to be selected automatically

Composables & Components:

- `defineOgImageStatic()` is deprecated, use `defineOgImage()` (default behavior is to cache), if you want to be verbose you can use `defineOgImageCached()` or `<OgImageCached />`
-  `<OgImageStatic />` is deprecated, use `<OgImage />`
- `defineOgImageDynamic()` is deprecated, use `defineOgImageWithoutCache()`
- `<OgImageDynamic />` is deprecated, use `<OgImageWithoutCache />`

If you were using the runtime browser previously, you will need to manually opt-in for it to work in production.

```ts
export default defineNuxtConfig({
  ogImage: {
    runtimeBrowser: true
  }
})
```

::code-group

```vue [v1]
<script setup>
defineOgImageStatic({ /* */ })
</script>
```

```vue [v2]
<script setup>
defineOgImage({ /* */ })
</script>
```

::

### Nuxt Link Checker

Upgraded from v1 to v2:
- [v2 release notes](/link-checker/releases/v2)

Changes to nuxt.config `linkChecker`:
- `exclude` renamed to `excludeLinks`
- `failOn404` renamed to `failOnError`

### Nuxt SEO Experiments

The `nuxt-unhead` module has been renamed to `nuxt-seo-experiments`. This is to better reflect the scope of the module.

Upgraded from v1 to v3:
- [v2 release notes](https://github.com/harlan-zw/nuxt-link-checker/releases/2.0.0)
- [v2 release notes](/link-checker/releases/v3)

If you were using the `unhead` key to configure the module, you will need to change it to `seoExperiments`.

```diff
export default defineNuxtConfig({
-  unhead: {
+  seoExperiments: {
  }
})
```

### Nuxt SEO UI

This module replaces the functionality of the `Breadcrumb` component.

If you'd like to keep using the `Breadcrumb` component, you'll need to rename it to `SBreadcrumb`.

```diff
<template>
-  <Breadcrumb />
+  <SBreadcrumb />
</template>
```

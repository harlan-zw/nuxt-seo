---
title: Nuxt Config
description: The config options available for Nuxt Site Config.
---

## `enabled`

- Type: `boolean`
- Default: `true`

Whether the site config is enabled.

## `debug`

- Type: `boolean`
- Default: `false`

Whether the debug mode of the site config is enabled.

## `componentOptions`

- Type: `object`
- Default: `{}`

Modify the behaviour of how the [&lt;SiteLink&gt;](/site-config/api/site-link) is registered.

```ts
export default defineNuxtConfig({
  site: {
    componentOptions: {
      prefix: 'I',
      global: true,
    },
  },
})
```

```vue
<template>
  <ISiteConfig to="/foo">
    Foo
  </ISiteConfig>
</template>
```

## `url`

- Type: `string`

The canonical site URL.

## `env`

- Type: `string`
- Default: `process.env.NODE_ENV`

The environment the site is running in.

See [this issue](https://github.com/nuxt/nuxt/issues/19819) on why we can't use `process.env.NODE_ENV`.

## `name`

- Type: `string`

The name of the site.

## `indexable`

- Type: `boolean`
- Default: `siteConfig.env === 'production' || process.env.NODE_ENV === 'production'`

Can the site be indexed by search engines.

## `trailingSlash`

- Type: `boolean`
- Default: `false`

Whether to add trailing slashes to the URLs.

## `description`

- Type: `string`

The description of the site.

## `defaultLocale`

- Type: `string`

The default locale of the site.

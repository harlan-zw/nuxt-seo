# @nuxtjs/seo

[![npm version](https://img.shields.io/npm/v/@nuxtjs/seo/latest.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmx.dev/package/@nuxtjs/seo)
[![npm downloads](https://img.shields.io/npm/dm/@nuxtjs/seo.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmx.dev/package/@nuxtjs/seo)
[![License](https://img.shields.io/github/license/harlan-zw/nuxt-seo.svg?style=flat&colorA=020420&colorB=00DC82)](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md)

> Fully equipped Technical SEO & AEO for busy Nuxters.

`@nuxtjs/seo` installs the 7 core [Nuxt SEO](https://nuxtseo.com) modules in one step:

| Module | Package |
|--------|---------|
| Robots | [@nuxtjs/robots](https://github.com/nuxt-modules/robots) |
| Sitemap | [@nuxtjs/sitemap](https://github.com/nuxt-modules/sitemap) |
| Schema.org | [nuxt-schema-org](https://github.com/harlan-zw/nuxt-schema-org) |
| OG Image | [nuxt-og-image](https://github.com/nuxt-modules/og-image) |
| SEO Utils | [nuxt-seo-utils](https://github.com/harlan-zw/nuxt-seo-utils) |
| Link Checker | [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) |
| Site Config | [nuxt-site-config](https://github.com/harlan-zw/nuxt-site-config) |

## Install

```bash
npx nuxt module add seo
```

Then set your site URL and name:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: {
    url: 'https://example.com',
    name: 'My Site',
  },
})
```

You configure each module through its own key, for example `sitemap`, `robots`, or `ogImage`.

## Documentation

- [Introduction](https://nuxtseo.com/docs/nuxt-seo/getting-started/introduction)
- [Using the modules](https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules)
- [Nuxt Content](https://nuxtseo.com/docs/nuxt-seo/guides/nuxt-content)
- [Troubleshooting](https://nuxtseo.com/docs/nuxt-seo/getting-started/troubleshooting)

## License

Licensed under the [MIT license](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md).

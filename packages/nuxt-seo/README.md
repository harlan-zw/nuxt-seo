<a href="https://nuxtseo.com"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/harlan-zw/nuxt-seo/main/.github/assets/logo-dark.svg">
  <img src="https://raw.githubusercontent.com/harlan-zw/nuxt-seo/main/.github/assets/logo-light.svg" width="64" height="64" alt="Nuxt SEO">
</picture></a>

# @nuxtjs/seo

[![npm version](https://img.shields.io/npm/v/@nuxtjs/seo/latest.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmx.dev/package/@nuxtjs/seo)
[![npm downloads](https://img.shields.io/npm/dm/@nuxtjs/seo.svg?style=flat&colorA=020420&colorB=00DC82)](https://npmx.dev/package/@nuxtjs/seo)
[![License](https://img.shields.io/github/license/harlan-zw/nuxt-seo.svg?style=flat&colorA=020420&colorB=00DC82)](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md)

> Fully equipped Technical SEO & AEO for busy Nuxters.

`@nuxtjs/seo` installs 9 [Nuxt SEO](https://nuxtseo.com) modules in one step:

| Module | Package |
|--------|---------|
| Robots | [@nuxtjs/robots](https://github.com/nuxt-modules/robots) |
| Sitemap | [@nuxtjs/sitemap](https://github.com/nuxt-modules/sitemap) |
| Schema.org | [nuxt-schema-org](https://github.com/harlan-zw/nuxt-schema-org) |
| OG Image | [nuxt-og-image](https://github.com/nuxt-modules/og-image) |
| SEO Utils | [nuxt-seo-utils](https://github.com/harlan-zw/nuxt-seo-utils) |
| Link Checker | [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) |
| Site Config | [nuxt-site-config](https://github.com/harlan-zw/nuxt-site-config) |
| AI Ready | [nuxt-ai-ready](https://github.com/harlan-zw/nuxt-ai-ready) |
| Skew Protection | [nuxt-skew-protection](https://github.com/harlan-zw/nuxt-skew-protection) |

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

## Defaults

AI Ready serves `llms.txt` and Markdown versions of pages. Prerendering also generates `llms-full.txt`.
Databases, background indexing, and cron remain opt-in.
The bundle disables project agent skills and API catalogs by default.
To publish them, configure `aiReady.agentSkills` or `aiReady.apiCatalog`.

Skew Protection retains old build assets and uses Nuxt's manifest polling.
The bundle disables version cookies. Connection, route, and IP tracking remain off.
Site configuration takes precedence over these defaults.

If CI starts from a clean checkout, preserve `node_modules/.cache/nuxt-seo/skew-protection` between builds.
You can also configure shared storage through `skewProtection.storage`.
Without build history, the module cannot retain previous deployments.

## Migrate from v5

Nuxt SEO v6 requires Nuxt 4.1 or later.
Nuxt 3 sites must upgrade Nuxt before upgrading the bundle.

Remove AI Ready and Skew Protection from `modules` if you listed them separately.
Keep their `aiReady` and `skewProtection` configuration.
To disable either module, use its own key:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  aiReady: false,
  skewProtection: false,
})
```

If you need server checks through `isClientOutdated`, enable `skewProtection.cookie` with a cookie configuration object.

## Documentation

- [Introduction](https://nuxtseo.com/docs/nuxt-seo/getting-started/introduction)
- [Using the modules](https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules)
- [Nuxt Content](https://nuxtseo.com/docs/nuxt-seo/guides/nuxt-content)
- [Troubleshooting](https://nuxtseo.com/docs/nuxt-seo/getting-started/troubleshooting)

## License

Licensed under the [MIT license](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md).

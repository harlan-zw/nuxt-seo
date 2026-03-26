<h1>@nuxtjs/seo</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

> Fully equipped Technical SEO for busy Nuxters.

[Nuxt SEO](https://nuxtseo.com) is an ecosystem of SEO modules, tools, and tutorials built around the Nuxt community. Technical SEO requires many moving parts: sitemaps, robots.txt, Schema.org, OG images, meta tags, broken links. Nuxt SEO provides a module for each, so you can install them individually or all at once.

<p align="center">
<table>
<tbody>
<td align="center">
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
</td>
</tbody>
</table>
</p>

## Features

- 🤖 **Crawl Control**: Automatic `robots.txt` generation, `<meta name="robots">` tags, and `X-Robots-Tag` headers to manage how search engines access your site.
- 📄 **Sitemaps**: Auto-generated `sitemap.xml` from your app's data sources, with multi-sitemap support for i18n sites.
- 🖼️ **OG Images**: Dynamic Open Graph image generation for every page, no manual design work needed.
- 🔎 **Structured Data**: Schema.org JSON-LD generated automatically with sensible defaults and opt-in rich schemas.
- ✅ **Link Checking**: Broken link detection at build time with [ESLint](https://eslint.org) integration and DevTools support.
- △ **SEO Utils**: Automatic favicons, default meta tags, breadcrumbs, and social share links.

## The `@nuxtjs/seo` Module

The `@nuxtjs/seo` package is a simple alias for installing all of the modules in one go.

```ts
// This is all it does!
export default defineNuxtModule<ModuleOptions>({
  moduleDependencies: {
    '@nuxtjs/robots': { version: '>=6.0' },
    '@nuxtjs/sitemap': { version: '>=8.0' },
    'nuxt-link-checker': { version: '>=5.0' },
    'nuxt-og-image': { version: '>=6.2' },
    'nuxt-schema-org': { version: '>=6.0' },
    'nuxt-seo-utils': { version: '>=8.1' },
    'nuxt-site-config': { version: '>=4.0' },
  },
})
```

Every module works standalone. Install `@nuxtjs/seo` to get everything at once, or pick only what you need (e.g. Sitemap and Robots). Configuration, composables, and features are identical either way.

### Modules

| Module | Package | What it solves |
|--------|---------|----------------|
| Robots | [@nuxtjs/robots](https://github.com/nuxt-modules/robots) | Search engines need clear instructions about which pages to crawl and index |
| Sitemap | [@nuxtjs/sitemap](https://github.com/nuxt-modules/sitemap) | Search engines can't discover all your pages without a structured index |
| OG Image | [nuxt-og-image](https://github.com/nuxt-modules/og-image) | Social platforms need preview images when content is shared |
| Schema.org | [nuxt-schema-org](https://github.com/harlan-zw/nuxt-schema-org) | Rich snippets and search features require structured data |
| SEO Utils | [nuxt-seo-utils](https://github.com/harlan-zw/nuxt-seo-utils) | Favicons, default meta, breadcrumbs, and other SEO essentials |
| Link Checker | [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) | Broken links harm SEO and user experience |
| Site Config | [nuxt-site-config](https://github.com/harlan-zw/nuxt-site-config) | All modules need consistent site URL, name, and locale config |

> [!NOTE]
> Site Config installs automatically with any SEO module. It provides a unified configuration layer that works across all modules at both build time and runtime.

## Installation

```sh
npx nuxi@latest module add seo
```

> [!TIP]
> Generate an Agent Skill for this package using [skilld](https://github.com/harlan-zw/skilld):
> ```bash
> npx skilld add @nuxtjs/seo
> ```

Once installed, check the [Using the Modules](https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules) guide to get started.

## SEO Tools

Free online tools for debugging and validating your SEO:

- [Meta Tag Checker](https://nuxtseo.com/tools/meta-tag-checker)
- [Schema Validator](https://nuxtseo.com/tools/schema-validator)
- [XML Sitemap Validator](https://nuxtseo.com/tools/xml-sitemap-validator)
- [Robots.txt Validator](https://nuxtseo.com/tools/robots-txt-validator)
- [Social Share Debugger](https://nuxtseo.com/tools/social-share-debugger)

## Documentation

[Read the full documentation](https://nuxtseo.com/) for configuration options, guides, and examples.

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>

## License

Licensed under the [MIT license](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md).

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/seo/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxtjs/seo

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/seo.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/seo

[license-src]: https://img.shields.io/github/license/harlan-zw/nuxt-seo.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt
[nuxt-href]: https://nuxt.com

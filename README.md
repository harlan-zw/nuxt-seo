<h1><a href="https://nuxtseo.com"><img src=".github/assets/logo.svg" width="40" height="40" alt="Nuxt SEO" align="top"></a> @nuxtjs/seo</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Skill repository on skilld.dev][skilld-src]][skilld-href]

Nuxt SEO installs and configures nine SEO modules for Nuxt.
Use the bundle, or install each module separately.

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

- 🤖 **[Robots](https://github.com/nuxt-modules/robots):** Generate `robots.txt`, robots meta tags, and `X-Robots-Tag` headers.
- 📄 **[Sitemap](https://github.com/nuxt-modules/sitemap):** Generate sitemaps from routes and data sources, with i18n support.
- 🔎 **[Schema.org](https://github.com/harlan-zw/nuxt-schema-org):** Add JSON-LD structured data to your pages.
- 🖼️ **[OG Image](https://github.com/nuxt-modules/og-image):** Generate Open Graph images from Vue components.
- △ **[SEO Utils](https://github.com/harlan-zw/nuxt-seo-utils):** Manage titles, meta tags, canonical URLs, breadcrumbs, favicons, and social share links.
- ✅ **[Link Checker](https://github.com/harlan-zw/nuxt-link-checker):** Find broken links during development and builds.
- 🔧 **[Site Config](https://github.com/harlan-zw/nuxt-site-config):** Share site URLs, names, and locales across modules.
- 🧠 **[AI Ready](https://github.com/harlan-zw/nuxt-ai-ready):** Provide `llms.txt` and Markdown versions of your pages.
- 🛡️ **[Skew Protection](https://github.com/harlan-zw/nuxt-skew-protection):** Keep previous build assets available after deployment.

## Installation

Nuxt SEO v6 requires Nuxt `^4.6.1 || ^5.0.0` and Node `^22.22.3 || ^24.15.0 || >=26.0.0`.
Nuxt 3 projects stay on Nuxt SEO v5.
If you use v5, read the [migration guide](https://nuxtseo.com/docs/nuxt-seo/migration-guide/v5-to-v6).

From your Nuxt project, install all nine modules:

```bash
npx nuxt module add seo
```

Or install individual modules:

```bash
npx nuxt module add sitemap robots
```

Site Config installs automatically with any SEO module.
The bundle checks module versions at build time and configuration during development.
It uses polling for Skew Protection and disables its version cookie. Your module options take precedence.

> [!TIP]
> Using an AI agent? Get the @nuxtjs/seo Skill on [skilld.dev/gh/harlan-zw/nuxt-seo](https://skilld.dev/gh/harlan-zw/nuxt-seo).

## Documentation

- [Using the modules](https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules)
- [Disabling modules](https://nuxtseo.com/docs/nuxt-seo/guides/disabling-modules)
- [Full documentation](https://nuxtseo.com/docs/nuxt-seo/getting-started/introduction)
- [Free SEO tools](https://nuxtseo.com/tools)
- [SEO guides](https://nuxtseo.com/learn-seo)

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>

## License

Licensed under the [MIT license](https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md).

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/seo/latest.svg?style=flat&labelColor=16152b&color=00a63e
[npm-version-href]: https://npmjs.com/package/@nuxtjs/seo

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/seo.svg?style=flat&labelColor=16152b&color=00a63e
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/seo

[license-src]: https://img.shields.io/github/license/harlan-zw/nuxt-seo.svg?style=flat&labelColor=16152b&color=00a63e
[license-href]: https://github.com/harlan-zw/nuxt-seo/blob/main/LICENSE.md

[nuxt-src]: https://img.shields.io/badge/Nuxt-16152b?logo=nuxt&style=flat
[nuxt-href]: https://nuxt.com

[skilld-src]: https://skilld.dev/b/harlan-zw/nuxt-seo?style=flat&labelColor=16152b&color=00a63e&logoColor=ffffff
[skilld-href]: https://skilld.dev/gh/harlan-zw/nuxt-seo

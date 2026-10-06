<h1>@nuxtjs/seo</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
<a href="https://skilld.dev/gh/harlan-zw/nuxt-seo/nuxtjs-seo">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://skilld.dev/b/harlan-zw/nuxt-seo/nuxtjs-seo?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://skilld.dev/b/harlan-zw/nuxt-seo/nuxtjs-seo?theme=light">
    <img alt="Skill repository on skilld.dev" src="https://skilld.dev/b/harlan-zw/nuxt-seo/nuxtjs-seo?theme=light">
  </picture>
</a>

> Fully equipped Technical SEO & AEO for busy Nuxters.

[Nuxt SEO](https://nuxtseo.com) is an ecosystem of SEO modules, tools, and tutorials built with and for the Nuxt community. Search has changed: Google still matters, but [ChatGPT](https://chatgpt.com), Claude, [Perplexity](https://perplexity.ai), and AI Overviews now answer questions your site could answer, and they only cite sources they can parse. Nuxt SEO ships the full stack, robots.txt, sitemaps, Schema.org, OG images, meta tags, link checks, to make your Nuxt app discoverable by both search engines and answer engines.

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

- 🤖 **Crawl Control**: Automatic `robots.txt` generation, `<meta name="robots">` tags, and `X-Robots-Tag` headers to manage how search engines and AI crawlers access your site.
- 📄 **Sitemaps**: Auto-generated `sitemap.xml` from your app's data sources, with multi-sitemap support for i18n sites.
- 🔎 **Structured Data**: Schema.org JSON-LD generated automatically, the single biggest lever for rich results, AI Overviews, and entity recognition.
- 🖼️ **OG Images**: Dynamic Open Graph image generation for every page, no manual design work needed.
- △ **SEO Utils**: Clean titles, default meta, canonical URLs, breadcrumbs, favicons, and social share links, AEO fundamentals AI parsers rely on.
- ✅ **Link Checking**: Broken link detection at build time with [ESLint](https://eslint.org) integration and DevTools support.

### Made for the age of AI answers

Traditional SEO signals (clean HTML, structured data, crawlable sitemaps, valid meta) are the same signals AI crawlers use to decide what to cite. Nuxt SEO also includes [`nuxt-ai-ready`](https://github.com/harlan-zw/nuxt-ai-ready) for `llms.txt` and on-demand Markdown endpoints. MCP tools require a separate opt-in.

```sh
npx nuxt module add seo
# then verify:
npx @vercel/agent-readability audit https://your-site.com
```

## The `@nuxtjs/seo` Module

The `@nuxtjs/seo` package is a simple alias for installing all of the modules in one go.

```ts
// This is almost all it does. Setup also fails the build on an unsupported
// Nuxt version, or when a loaded module is older than its version below.
export default defineNuxtModule<ModuleOptions>({
  moduleDependencies: {
    '@nuxtjs/robots': { version: '>=6.0' },
    '@nuxtjs/sitemap': { version: '>=8.3' },
    'nuxt-link-checker': { version: '>=4.3' },
    'nuxt-og-image': { version: '>=6.4.4' },
    'nuxt-schema-org': { version: '>=5.0' },
    'nuxt-seo-utils': { version: '>=7.0' },
    'nuxt-site-config': { version: '>=4.0' },
    'nuxt-skew-protection': {
      version: '>=1.6.1',
      defaults: { updateStrategy: 'polling', cookie: false },
    },
    'nuxt-ai-ready': {
      version: '>=2.5.2',
      defaults: { agentSkills: false, apiCatalog: false },
    },
    '@nuxtjs/i18n': { version: '>=10.0', optional: true },
  },
})
```

Every module works standalone. Install `@nuxtjs/seo` to get everything at once, or pick only what you need. The bundle defaults to polling, disables version cookies, and keeps agent skills and API catalogs opt-in. Your module configuration takes precedence.

### Modules

| Module | Package | What it solves |
|--------|---------|----------------|
| Robots | [@nuxtjs/robots](https://github.com/nuxt-modules/robots) | Control which crawlers (Googlebot, GPTBot, ClaudeBot, PerplexityBot…) can access which pages |
| Sitemap | [@nuxtjs/sitemap](https://github.com/nuxt-modules/sitemap) | Give every crawler, search and answer engine, a full index of your content |
| Schema.org | [nuxt-schema-org](https://github.com/harlan-zw/nuxt-schema-org) | The structured data AI engines rely on to understand entities, authors, products, FAQs |
| OG Image | [nuxt-og-image](https://github.com/nuxt-modules/og-image) | Preview images for social shares and chat-bot rich cards |
| SEO Utils | [nuxt-seo-utils](https://github.com/harlan-zw/nuxt-seo-utils) | Favicons, canonicals, breadcrumbs, default meta, the AEO fundamentals |
| Link Checker | [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) | Broken links harm SEO, confuse AI crawlers, and hurt UX |
| Site Config | [nuxt-site-config](https://github.com/harlan-zw/nuxt-site-config) | Unified site URL, name, and locale config shared across every module |

| AI Ready | [nuxt-ai-ready](https://github.com/harlan-zw/nuxt-ai-ready) | `llms.txt` and on-demand `.md` route variants |
| Skew Protection | [nuxt-skew-protection](https://github.com/harlan-zw/nuxt-skew-protection) | Persistent assets and instant updates across deployments |

> [!NOTE]
> Site Config installs automatically with any SEO module. It provides a unified configuration layer that works across all modules at both build time and runtime.

## Installation

Install everything at once:

```sh
npx nuxt module add seo
```

Or pick only what you need:

```sh
npx nuxt module add sitemap robots
```

Nuxt SEO v6 requires Nuxt 4.1 or later. See the [v5 migration steps](packages/nuxt-seo/README.md#migrate-from-v5).

> [!TIP]
> Using an AI agent? Get the @nuxtjs/seo Skill on [skilld.dev/gh/harlan-zw/nuxt-seo/nuxtjs-seo](https://skilld.dev/gh/harlan-zw/nuxt-seo/nuxtjs-seo).

Once installed, check the [Using the Modules](https://nuxtseo.com/docs/nuxt-seo/guides/using-the-modules) guide to get started.

## Going Further

Modules handle the technical foundation. Validating your live site is equally important:

- [Meta Tag Checker](https://nuxtseo.com/tools/meta-tag-checker)
- [Schema Validator](https://nuxtseo.com/tools/schema-validator)
- [XML Sitemap Validator](https://nuxtseo.com/tools/xml-sitemap-validator)
- [Robots.txt Validator](https://nuxtseo.com/tools/robots-txt-validator)
- [Social Share Debugger](https://nuxtseo.com/tools/social-share-debugger)

Learn more about SEO and AEO:

- [SEO Checklist](https://nuxtseo.com/learn-seo/checklist)
- [AI-Optimized Content](https://nuxtseo.com/learn-seo/nuxt/launch-and-listen/ai-optimized-content)
- [llms.txt Guide](https://nuxtseo.com/learn-seo/nuxt/controlling-crawlers/llms-txt)
- [Pre-Launch Warmup](https://nuxtseo.com/learn-seo/pre-launch-warmup)

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

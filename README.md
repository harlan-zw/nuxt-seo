<h1 align='center'>🍱 Nuxt SEO Kit</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-seo-kit/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-seo-kit" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-seo-kit?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-seo-kit" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-seo-kit?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-seo-kit" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-seo-kit?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
The All-In-One SEO Layer for Nuxt 3.
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="800" height="0" /><br>
<i>Status:</i> <a href="https://github.com/harlan-zw/nuxt-seo-kit/releases/tag/v1.0.0">v1 Released</a></b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
<img width="800" height="0" />
</td>
</tbody>
</table>
</p>

## Background

Technical SEO is hard. It requires many moving parts that need to work well together. Configuring all of these parts
correctly is a challenge.

Nuxt SEO is the total SEO solution for Nuxt. It combines all of my SEO modules and best practices into one with
absolute minimal effort.

With powerful APIs built for fully dynamic sites and zero-config defaults for static sites.

## Modules

- 📖 [nuxt-simple-sitemap](https://github.com/harlan-zw/nuxt-simple-sitemap) - Sitemap.xml Support
- 🤖 [nuxt-simple-robots](https://github.com/harlan-zw/nuxt-simple-robots) - Manage site crawling
- 🔎 [nuxt-schema-org](https://unhead-schema-org.harlanzw.com/) - Generate Schema.org JSON-LD for SEO
- △ [nuxt-unhead](https://github.com/harlan-zw/nuxt-unhead) - Experimental SEO meta features
- 🖼️ [nuxt-og-image](https://github.com/harlan-zw/nuxt-og-image) - Generate dynamic social share images
- ✅ [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) - Check for broken links

## Features

**🤖 Search engine visibility solved**

- Get the right content crawled with robot rules (robots.txt, HTTP header, meta tags)
- Let search engines find your content (sitemap.xml)
- Structured data for rich search results (Schema.org)
- Automatic canonical URLs

**🔗 Enhanced Social Sharing**

- Generate dynamic or static screen social share images
- Automatic opengraph and twitter meta tags

**😌 Find issues before they become a problem**

- Trailing Slashes automatically handled correctly
- Discover broken links

**✨ And much more**

- [Runtime Config Template Tokens](https://github.com/harlan-zw/nuxt-unhead#runtime-config-template-tokens)
- Use route rules to manage custom config
- Use `definePageMeta` for title, description and image
- `<Breadcrumbs />` - Generate Schema.org compliant breadcrumbs with zero-config
- More coming soon!

## Install

1. Install `@nuxtseo/module` dependency to your project:

```sh
pnpm i -D @nuxtseo/module
yarn add -D @nuxtseo/module
npm install -D @nuxtseo/module
```

2. Add it to your `modules` section in your `nuxt.config`:

```ts [nuxt.config]
export default defineNuxtConfig({
  modules: ['@nuxtseo/module']
})
```

That's it!

All features are enabled by default. Learn more by exploring the [documentation](https://nuxtseo.com)

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>


## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)

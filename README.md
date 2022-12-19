<h1 align='center'>nuxt-seo-kit</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-seo-kit/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-seo-kit" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-seo-kit?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-seo-kit" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-seo-kit?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-seo-kit" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-seo-kit?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
The all-in-one Nuxt v3 layer to supercharge your SEO. 
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="800" height="0" /><br>
<i>Status:</i> Early Access</b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
<img width="800" height="0" />
</td>
</tbody>
</table>
</p>

## Background

Configuring SEO for Nuxt v3 is a lot of work, it requires installing many modules, configuring them all separately
and then figuring out all the meta tags.

What if it was easy and just worked?

Introducing Nuxt SEO Kit, the all-in-one SEO module for Nuxt v3. Combining all of my SEO modules and best practices into one, it's the easiest way to get your app SEO ready. 

## Modules

- 📖 [nuxt-simple-sitemap](https://github.com/harlan-zw/nuxt-simple-sitemap) - Sitemap.xml Support
- 🤖 [nuxt-simple-robots](https://github.com/harlan-zw/nuxt-simple-robots) - Manage site crawling
- 🔎 [nuxt-schema-org](https://unhead-schema-org.harlanzw.com/) - Generate Schema.org JSON-LD for SEO
- △ [nuxt-unhead](https://github.com/harlan-zw/nuxt-unhead) - Experimental SEO meta features
- 🖼️ [nuxt-og-image](https://github.com/harlan-zw/nuxt-og-image) - Generate dynamic social share images
- ✅ [nuxt-link-checker](https://github.com/harlan-zw/nuxt-link-checker) - Check for broken links


## Features

**🤖 SEO Enhancements**

Generates files: `sitemap.xml`, `robots.txt`

Generates meta tags: canonical url, opengraph, twitter, schema.org

**🍞 SEO Components** 

- `<SeoKit />` - Generate SEO meta tags
- `<Breadcrumbs />` - Generate sitemap.xml

**✨ Powerfully, easy configuration**

- Use route rules to manage custom robot and sitemap config
- Use `definePageMeta` for title, description and image

**🏞️ Handle Trailing Slashes**

- Universal Trailing Slashes

## Install

```bash
npm install --save-dev nuxt-seo-kit

# Using yarn
yarn add --dev nuxt-seo-kit
```

## Register Layer

_nuxt.config.ts_

```ts
export default defineNuxtConfig({
  extends: [
    'nuxt-seo-kit'
  ]
})
```

## Usage

### Define Runtime Config

_nuxt.config.ts_

```ts
// @todo
```

### Define App Config

_app.config.ts_

```ts
// @todo
```

### Use SeoKit Component

```vue
<template>
  <SeoKit />
</template>
```


## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>


## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)

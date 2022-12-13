<h1 align='center'>△ nuxt-seo-kit</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-unhead/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-unhead" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-unhead?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-unhead" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-unhead?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-unhead" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-unhead?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
Nuxt v3 layer for building super-charged SEO apps.
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

## Included Modules

- △ [nuxt-unhead](https://github.com/harlan-zw/nuxt-unhead) - Nuxt v3 layer for building a super-charged SEO site.
- 🔎 [Schema.org](https://github.com/) - Generate Schema.org JSON-LD for SEO
- 📖 [nuxt-simple-sitemap](https://github.com/harlan-zw/nuxt-simple-sitemap) - Sitemap support

## Features

- Easily manage robot and sitemap config with route rules
- Robots.txt, sitemap.xml generation
- Canonical URLs
- SEO Components (Breadcrumb, FAQ)
- Best practice SEO meta tags
- Use `definePageMeta` for title, description and image

## Register Layer

_nuxt.config.ts_

```ts
export default defineNuxtConfig({
  extend: [
    'github:harlan-zw/nuxt-seo-kit#main'
  ]
})
```


## Composables

### useSeoMeta

Define your meta tags as a flat object. This function is automatically imported for you.

Behind the scenes, this unpacks your meta tags and adds them as if you used `useHead` directly.

Powered by [packrup](https://github.com/harlan-zw/packrup) and [zhead](https://github.com/harlan-zw/zhead).

```ts
useSeoMeta({
  ogImage: "https://nuxtjs.org/meta_400.png",
  ogUrl: "https://nuxtjs.org",
  ogSiteName: "NuxtJS",
  ogType: "website",
  ogLocale: "en_US",
  ogLocaleAlternate: "fr_FR",
  twitterSite: "@nuxt_js",
})
```

## Components

### DebugHead

A component to debug your head tags.

<img src="https://raw.githubusercontent.com/harlan-zw/nuxt-unhead/main/.github/component.png" alt="DebugHead Component preview">

```vue
<template>
  <DebugHead />
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

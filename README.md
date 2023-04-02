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

Configuring SEO for Nuxt is a lot of work; it requires installing many modules, configuring them all separately
and then figuring out all the meta tags.

What if there was an easier way?

Introducing Nuxt SEO Kit,
the all-in-one SEO module for Nuxt 3. Combining all of my SEO modules and the best practices into one,
it's the easiest and quickest way to improve your apps SEO. 

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

```bash
npm install --save-dev nuxt-seo-kit

# Using yarn
yarn add --dev nuxt-seo-kit
```

Requires Nuxt >= 3.1.0.

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

### 1. Define Config

For configuration to be accessibility to both the Nuxt App, modules and server, config should be provided in the
runtime config.

This also allows you to easily override config for different environments.

_nuxt.config.ts_

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      siteName: 'Awesome Site',
      siteDescription: 'Welcome to my awesome site!',
      language: 'en', // prefer more explicit language codes like `en-AU` over `en`
    }
  },
})
```

### 2. Add Components

#### SeoKit

To make the most of Nuxt SEO Kit, you should use the `SeoKit` component somewhere in your 
app layout.

This component will set the default meta tags for your app. It's important to have this run
before any page-specific meta tags are set.

_app.vue_

```vue
<template>
  <div>
    <SeoKit />
    <NuxtPage />
  </div>
</template>
```

### Done! 🥳

You have the essentials all set up! 

Next steps:
1. Choose a Schema.org [identity](https://unhead-schema-org.harlanzw.com/guide/guides/identity)
2. Read the guides below
3. Scan your site with [Unlighthouse](https://github.com/harlan-zw/unlighthouse) to validate any SEO issues

## Guide

### Modify Title Template

The default title template for your site will be `%s %titleSeparator %siteName`, unless you change it.

Please read the [Runtime Config Template Tokens](https://github.com/harlan-zw/nuxt-unhead#runtime-config-template-tokens) guide
on using the tokens.

If you'd like to change the title separator (the default is `–`), you can provide the runtime config.

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      titleSeparator: '|'
    }
  },
})
```

Otherwise, you can modify the `titleTemplate` to your liking with nuxt config or using `useHead`.

```ts
export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: '%pageTitle %titleSeparator %siteName'
    }
  }
})
```

#### Generating default OG Images

You can provide all your routes with OG Image generation by simply adding one of the OG Image components or composables to your `app.vue`.

Please check the [Nuxt Og Image](https://github.com/harlan-zw/nuxt-og-image) docs for full usage.

```vue
<template>
  <div>
    <SeoKit />
    <!-- a. Generates browser screenshots for every page -->
    <OgImageScreenshot />
    <!-- b. Generate saotir images for every page (uses the default template) -->
    <OgImageStatic />
    <NuxtPage />
  </div>
</template>
```

### Enabling Trailing Slash

Nuxt SEO Kit allows you to enable global trailing slashes using the runtime config.

This will automatically add trailing slashes to your sitemap and add it as canonical URL.

Note: You will need to still manually write your `<NuxtLink>` with trailing slashes.

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      trailingSlash: true,
    }
  },
})
```

### Avoid deploying broken links

By default, Nuxt SEO Kit won't block your builds if 404 links are discovered. 

To enable this, you can provide the `linkChecker.failOn404` option.

```ts
export default defineNuxtConfig({
  linkChecker: {
    failOn404: true,
  }
})
```

### Using .env

It can be useful to change the host name based on which environment you have the nuxt App running on.

You can do this with an .env file and the following keys.

```env
NUXT_PUBLIC_SITE_URL="https://harlanzw.com"
NUXT_INDEXABLE=true
```

### Disabling site indexing

By default, Nuxt SEO Kit will allow search engines to index your site in production environments.

If you want to disable this, you can set `indexable` to `false` in your config.

```ts
export default defineNuxtConfig({
  runtimeConfig: {
    indexable: false
  },
})
```

Alternatively, you can set the `NUXT_INDEXABLE=false` environment variable.

### Using the Breadcrumbs component

The `Breadcrumbs` component is a Schema.org compliant breadcrumbs component. 

```vue
<template>
  <Breadcrumbs>
    <template #breadcrumb="{ to, title }">
      <NuxtLink :to="to">
        {{ title }}
      </NuxtLink>
    </template>
  </Breadcrumbs>
</template>
```


It will automatically infer the routes and labels from your Nuxt router.

Firstly, it will check the `breadcrumbTitle` property on the route meta. If that is not present, it will use the `title` property.

```vue
<script lang="ts" setup>
definePageMeta({
  breadcrumbTitle: 'Breadcrumbs are cool',
})
</script>
```


### Providing page meta

To provide page meta, you can make use of the Nuxt 3.1 feature `useSeoMeta`, which allows you provide reactive meta tags.

```vue
<script lang="ts" setup>
useSeoMeta({
  title: 'Home',
  description: 'Welcome to my website',
  // reactive example
  ogImage: () => someData.value?.image
})
</script>
```

Alternatively, you can use the `definePageMeta` function to set page-specific meta tags. Note that this data can not be reactive.

```vue
<script lang="ts" setup>
definePageMeta({
  title: 'Home',
  description: 'Welcome to my website',
  image: '/images/home.jpg',
})
</script>
```

### Setting a og:title template

By default, the package sets a template for the `og:title` that matches the `title`.

That is `%s ${config.titleSeparator} ${config.siteName}`.

You can override this by setting a `ogTitleTemplate` in your config.

```ts
export default defineNuxtConfig({
  unhead: {
    ogTitleTemplate: '%s | My Website',
  }
})
```

## FAQ

### Why isn't there `twitter:*` meta tags?

The `twitter:` prefixed meta tags are only needed when they differ from the `og:` prefixes, except for the `twitter:card` tag.

You are welcome to modify the `twitter:*` meta tags using `definePageMeta` or `useSeoMeta`.

### Why are pages missing from my sitemap.xml?

This module currently relies on pre-rendering to figure out all of your site routes. If your route isn't being pre-rendered
then you will either need to manually add it to the sitemap.xml using hooks or pre-render it.

```ts
export default defineNuxtConfig({
  // option a. Add routes to pre-render
  nitro: {
    prerender: {
      routes: [
        '/',
        '/my-hidden-url'
      ]
    }
  },
  // option b. use hooks
  hooks: {
    'sitemap:generate': (ctx) => {
      // add custom URLs
      ctx.urls.push({
        url: '/my-hidden-url',
      })
    }
  }
})
```


## Live Examples

- https://github.com/harlan-zw/harlanzw.com
- https://github.com/unjs/unhead/tree/main/docs
- https://github.com/harlan-zw/unlighthouse/tree/main/docs
- https://github.com/harlan-zw/unhead-schema-org/tree/main/docs

## Sponsors

<p align="center">
  <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
    <img src='https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg'/>
  </a>
</p>


## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)

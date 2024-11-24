---
title: Documentation Site With Nuxt SEO
description: A starter kit for a documentation site with Nuxt SEO.
icon: i-heroicons-h1-solid
navigation:
  title: 'Documentation Site'
---

# Documentation Site SEO Recipe

## Introduction

Documentation sites have one job: getting users to the exact information they need, fast. Creating clear pathways through your documentation.

When users can't quickly find answers, they bounce - and high bounce rates signal to search engines that your content doesn't cut it.

The complexity comes from every guide, API reference, and code example needs to be discoverable without competing with each other.

Search engines need to understand your documentation's hierarchy, what content is most important, and how different pages relate to each other.

This recipe will show you general SEO guidelines for solving some of these as well how Nuxt SEO can help.

- Managing different versions of documentation i.e `/docs/v1`, `/docs/v2`
- Handling examples, guides, and API references
- Keeping content up-to-date with redirects
- Reducing bounce rates with clear page hierarchy
- Creating robust internal linking structures

## Quick Setup

All you need to get started:

:ModuleInstall{name="nuxt-seo"}

## Content Organization: Version Management

As a developer, we've all experienced trying to hunt down the documentation for a specific feature only to land on the wrong
version of the docs.

When we make a search on Google we want this behavior:
- `nuxt robots v2` - lands on the v2 documentation
- `nuxt robots` - lands on the latest version of the documentation

The strongest signal to search engines is the URL structure, but we can also [control search crawlers](/learn/controlling-crawlers).

### URL Structure

**✅ Best Practices:**

- Keep latest version at root (`/docs` or `/docs/latest`) with older versions clearly marked (`/docs/v2`, `/docs/v3`)
- Make sure all links point to the latest version, this will signal they are the most important
- For the non-latest version, include the version in page titles and descriptions
- Let the user know they are on an older version and provide a link to the latest version

We can look at how other sites handles this for inspiration.

::code-group

```dir [Laravel]
// Laravel uses canonicals to point to the latest version and always includes the version in the url
https://laravel.com/docs/<version>/routing
// i.e
https://laravel.com/docs/11.x/routing -> canonicals to master
https://laravel.com/docs/12.x/routing -> master
```

```dir [Vue]
// Vue does not use canonicals but has a clear signal in the subdomain and path prefix
https://v2.vuejs.org/v2/guide/list -> v2
https://vuejs.org/guide/essentials/list.html -> v3
```

```dir [Node]
// Node always canonicals the latest
https://nodejs.org/<page> -> master
https://nodejs.org/docs/<version>/<page> -> canonicals to master

https://nodejs.org/docs/latest-v20.x/api/index.html -> canonicals to https://nodejs.org/api/index.html
https://nodejs.org/docs/latest/api/documentation.html -> canonicals to https://nodejs.org/api/documentation.html
```

::

## Canonical Non-Latest Versions

- **[Canonical](/learn/controlling-crawlers/canonical-urls):** Tells search engines which version of a page to index.

There is some debate on whether to canonical non-latest versions to the latest version or not.

However, based on popular examples, we can see that adding a canonical to the latest version is the most common practice.

It still allows users to find the specific version of the docs they need through search while ensuring as Google does not
guarantee it won't show this in a result page. That the latest version is the one that search engines prioritize.

```vue [pages/docs/[version]/[...slug].vue]
<script lang="ts" setup>
const route = useRoute()

useHead({
  // Always point to the latest version
  link: [{
    rel: 'canonical',
    href: `https://docs.mysite.com/docs/${route.params.slug}`
  }]
})
</script>
```

## Noindexing Experimental Versions

- **[Noindex](/learn/controlling-crawlers/meta-tags):** Prevents search engines from indexing a page.

When working on experimental versions such as `beta`, `alpha`, of the docs, it's usually safest to just avoid these ending up in the
search results. This can be done by adding a `noindex` tag to the page.

::code-group

```vue [Vue / Nuxt]
// pages/docs/[version]/[...slug].vue
<script lang="ts" setup>
const route = useRoute()

// if it's beta
useSeoMeta({
  robots: route.params.version === 'beta' ? 'noindex, follow' : undefined
})
</script>
```

```vue [Nuxt Robots]
// pages/docs/[version]/[...slug].vue
<script lang="ts" setup>
const route = useRoute()
// disables indexing for beta versions
useRobotsRule(computed(() => route.params.version !== 'beta'))
</script>
```

::

## Titles

- **[Titles](/learn/mastering-page-titles):** The title of a page is a strong signal to search engines about the content.

When it comes to titles and descriptions, it's important to include the version number in the title and description of the page.

This helps users quickly identify which version of the docs they are on and helps search engines understand the content.

The easiest way to set this up naturally and dynamically is to use [Title Templates](/learn/mastering-page-titles#template-params).

```vue [pages/docs/[version]/[...slug].vue]
<script lang="ts" setup>
const route = useRoute()

const page = fetchPage() // fetches the page data

useHead({
  title: page.value.title,
  titleTemplate: '%s %separator %version %separator %siteName',
  templateParams: {
    siteName: 'My Docs',
    version: () => route.params.version
  }
})
</script>
```

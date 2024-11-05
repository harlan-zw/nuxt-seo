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

The complexity comes from managing dense internal linking structures, where every guide, API reference, and code example needs to be discoverable without competing with each other. 

Search engines need to understand your documentation's hierarchy, what content is most important, and how different pages relate to each other.

This recipe will show you general SEO guidelines for solving some of these as well how Nuxt SEO can help.

- Managing different versions of documentation i.e `/docs/v1`, `/docs/v2`
- Handling examples, guides, and API references
- Keeping content up-to-date with redirects
- Reducing bounce rates with clear page hierarchy
- Creating robust internal linking structures

## Quick Setup

All you need to get started:

:ModuleInstall{name="nuxt-seo"

## Content Organization: Version Management

As a developer, we've all experienced trying to hunt down the documentation for a specific feature only to land on the wrong
version of the docs.

It's challenging as sometimes we need to reference older versions of the documentation, and sometimes we just want the latest.

**✅ Best Practices:**

- Keep latest version at root (`/docs`) with older versions clearly marked (`/docs/v2`)
- Canonical all versioned pages to latest stable and block indexing of beta content
- Maintain consistent URLs between versions and set up redirects when content moves

### URL Structure

You are free to implement the URL structure how you like, here is some examples of how you could structure your URLs:

```dir [Laravel]
https://laravel.com/docs/<version>/routing

https://laravel.com/docs/11.x/routing
https://laravel.com/docs/12.x/routing
```

### Noindex vs Canonical

The challenge when managing multiple versions of documentation, is figuring out
what to inform search engines. We have two choices:

- **[Noindex](/learn/controlling-crawlers/meta-tags):** Prevents search engines from indexing a page.
- **[Canonical](/learn/controlling-crawlers/canonical-urls):** Tells search engines which version of a page to index.

For more background on these check out the [controlling crawlers](/learn/controlling-crawlers) guide.

As a guide, I recommend:
- Use canonical URLs for stable older versions
- Use `noindex` for beta/preview versions OR old versions that you're confident users won't need
- Point canonicals to the latest stable version

This ensures users can find the specific version of docs through search while avoiding preview content or outdated information
appearing in search results by default.

Here's how we might implement that:

```ts
// pages/docs/[version]/[...slug].vue
const route = useRoute()
const version = computed(() => route.params.version)
const latestVersion = 'v3'

// Handle different versioning scenarios
useSeoMeta({
  // Beta/Unreleased versions - always noindex
  robots: version.value.includes('beta') ? 'noindex, follow' : undefined,
  
  // Stable but old versions - use canonical
  canonical: version.value !== latestVersion 
    ? `https://docs.mysite.com/docs/${latestVersion}/${route.params.slug}`
    : undefined
})
```

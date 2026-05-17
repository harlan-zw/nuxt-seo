---
title: SEO Tips for Nuxt Sites
description: A short collection of SEO tips for content-driven Nuxt sites.
date: 2026-05-17
robots: index, follow
---

# SEO Tips

A few quick tips:

1. Set `site.url` in `nuxt.config.ts` so canonicals and sitemap entries are absolute.
2. Use `useSeoMeta()`{lang="ts"} in pages for type-safe meta tags.
3. Let `nuxt-og-image` auto-generate share images from your page metadata.
4. Use frontmatter `sitemap`, `robots`, and `schemaOrg` for per-page overrides.

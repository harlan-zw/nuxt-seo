---
title: Schema
description: The schema for some of the sitemap module data.
---

## Sitemap Entry

The sitemap entry schema mostly follows the [sitemap specification](https://www.sitemaps.org/protocol.html), the following options are supported:

- `loc` - URL of the page.
- `lastmod` - The date of last modification of the file
- `changefreq` - How frequently the page is likely to change.
- `priority` - The priority of this URL relative to other URLs on your site.
- `images` - An array of images to include in the sitemap entry as `<image:image>`.
- `video` - An array of videos to include in the sitemap entry as `<video:video>`.
- `news` - An array of news to include in the sitemap entry as `<news:news>`.
- `alternatives` - An array of alternatives to include in the sitemap entry as `<xhtml:link rel="alternate" ...>`.

```ts
export interface SitemapFullEntry {
  loc: string
  lastmod?: string | Date
  changefreq?: 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'
  priority?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
  alternatives?: Array<{
    hreflang: string
    href: string | URL
  }>
  news?: {
    title: string
    date: Date | string
    publicationName: string
    publicationLanguage: string
  }
  images?: Array<{
    loc: string | URL
    caption?: string
    geoLocation?: string
    title?: string
    license?: string | URL
  }>
  videos?: Array<{
    title: string
    thumbnailLoc: string | URL
    description: string
    contentLoc?: string | URL
    playerLoc?: string | URL
    duration?: number
    expirationDate?: Date | string
    rating?: number
    viewCount?: number
    publicationDate?: Date | string
    familyFriendly?: boolean
    restriction?: Restriction
    platform?: Restriction
    requiresSubscription?: boolean
    uploader?: {
      name: string
      info?: string | URL
    }
    live?: boolean
    tag?: string
  }>
}
```

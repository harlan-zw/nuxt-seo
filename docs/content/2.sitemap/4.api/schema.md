---
title: Schema
description: The schema for some of the sitemap module data.
---

## Sitemap Entry

The sitemap entry schema mostly follows the [sitemap specification](https://www.sitemaps.org/protocol.html), with additional Sitemap extension recommendations from Google such as [News](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap), [Images](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps), and [Videos](https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps).

The following options are supported:

- `loc` - URL of the page.
- `lastmod` - The date of last modification of the file
- `changefreq` - How frequently the page is likely to change.
- `priority` - The priority of this URL relative to other URLs on your site.
- `alternatives` - An array of alternatives to include in the sitemap entry as `<xhtml:link rel="alternate" ...>`.
- `news` - An array of news to include in the sitemap entry as `<news:news>`.
- `images` - An array of images to include in the sitemap entry as `<image:image>`.
- `video` - An array of videos to include in the sitemap entry as `<video:video>`.

```ts
export interface SitemapUrl {
  loc: string
  lastmod?: string | Date
  changefreq?: Changefreq
  priority?: 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1
  alternatives?: Array<AlternativeEntry>
  news?: GoogleNewsEntry
  images?: Array<ImageEntry>
  videos?: Array<VideoEntry>
  _i18nTransform?: boolean
  _sitemap?: string
  url?: string // @deprecated use `loc`
}

export type Changefreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export interface AlternativeEntry {
  hreflang: string
  href: string | URL
}

export interface GoogleNewsEntry {
  title: string
  publication_date: Date | string
  publication: {
    name: string
    language: string
  }
}

export interface ImageEntry {
  loc: string | URL
  caption?: string
  geoLocation?: string
  title?: string
  license?: string | URL
}

export interface VideoEntry {
  title: string
  thumbnail_loc: string | URL
  description: string
  content_loc?: string | URL
  player_loc?: string | URL
  duration?: number
  expiration_date?: Date | string
  rating?: number
  view_count?: number
  publication_date?: Date | string
  family_friendly?: 'yes' | 'no' | boolean
  restriction?: Restriction
  platform?: Platform
  price?: ({
    price?: number | string
    currency?: string
    type?: 'rent' | 'purchase' | 'package' | 'subscription'
  })[]
  requires_subscription?: 'yes' | 'no' | boolean
  uploader?: {
    uploader: string
    info?: string | URL
  }
  live?: 'yes' | 'no' | boolean
  tag?: string | string[]
}
```

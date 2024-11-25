---
title: Mastering Open Graph Tags in Vue & Nuxt
description: Cut through the noise of Open Graph tags. Learn what actually matters for social sharing, what you can skip, and how to implement them properly in Vue.
navigation:
  title: 'Open Graph Tags'
publishedAt: 2024-11-05
updatedAt: 2024-11-05
readTime: 8 mins
keywords:
  - vue open graph
  - og tags vue
  - social sharing vue
  - nuxt og tags
---

## Introduction

Open Graph (OG) tags mainly control how your content appears when shared on social platforms. However, they can also
provide better content understanding for web crawlers, similar to [Schema.org](/learn/mastering-meta/schema-org).

There are [60+ possible OG tags](https://ogp.me/) but most have specific use cases.

```html [Social Share]
<meta property="og:title" content="Your title that matters">
<meta property="og:description" content="Short description">
<meta property="og:image" content="https://mysite.com/og.png">
<meta property="og:url" content="https://mysite.com/page">
```

### Quick Tips

1. **Images matter**: A good og:image can double your click-through rate, they must be an absolute URL and at least 1200x600px.
2. **Make the title engaging**: Your og:title doesn't have to match your page title. While [page titles](/learn/mastering-meta/titles) need to be SEO-friendly, your og:title can be casual and provocative. Use emojis, numbers, and conversational language - social isn't search.
3. **Leverage Contextual OG Types**: You can mark up articles and author pages to provide more context for crawlers.

## Implementation in Vue

You should handle your OG tags with [`useSeoMeta()`{lang="ts"}](https://unhead.unjs.io/usage/composables/use-seo-meta),
this handles the use `property` attribute, which can be easy to forget.

```ts
useSeoMeta({
  ogTitle: 'Hey! Open graph images are important, check them out.',
  ogDescription: 'But who reads the description anyway?',
  ogImage: 'https://mysite.com/og.png', // must be absolute URL
  ogUrl: 'https://mysite.com/products/item' // this is your canonical url
})
```

## Useful Open Graph Tags

See the dedicated [`og:title`](/learn/mastering-meta/open-graph#ogtitle) and [`og:description`](/learn/mastering-meta/open-graph#ogdescription) sections for more details on these.

### `og:image`{lang="ts"}

The most important tag - invest time here.

Some rules:
- Must be an absolute URL
- Should be at least 1200x600px
- Set a `twitter:card` tag for X
- Use `og:image:alt` for accessibility

There are several other properties, including them can be useful to ensure
the image is being displayed correctly.

```ts
useSeoMeta({
  // ✅ use absolute URLs
  ogImage: 'https://mysite.com/og-images/product-preview.jpg',
  ogImageAlt: '3 boxes on top of each other',
  // Optional
  ogImageWidth: 1200,
  ogImageHeight: 600,
  ogImageType: 'image/jpeg',
  ogImageUrl: 'https://mysite.com/og-images/product-preview.jpg',
  // X specific tags
  twitterCard: 'summary_large_image',
  twitterImage: 'https://mysite.com/og-images/product-preview.jpg',
  twitterImageSrc: 'https://mysite.com/og-images/product-preview.jpg'
})
```

Create dynamic images using [Nuxt OG Image](/docs/og-image/getting-started/introduction).

### `og:type`{lang="ts}

Use this to provide context to crawlers. Common values are `website`, `article`, `book`, `profile`.

```ts
useSeoMeta({
  ogType: 'article'
})
```

### `og:url`{lang="ts}

Use this when setting your [canonical URL](/learn/controlling-crawlers/canonical-urls), they should match exactly.

```ts
useHead({
  link: [
    { rel: 'canonical', href: 'https://mysite.com/products/item' }
  ]
})
useSeoMeta({
  ogUrl: 'https://mysite.com/products/item',
})
```

## Dynamic OG Tags

Use Vue's reactivity to handle dynamic content.

- Do not set `og` data within `onMounted` as it won't be available to crawlers.

```vue
<script setup lang="ts">
const { data: product } = await useAsyncData(() => fetchProduct())

useSeoMeta({
  // Computed syntax keeps it reactive
  ogTitle: () => product.value.name,
  ogDescription: () => product.value.shortPitch,
  // Generate dynamic OG images - must be absolute
  ogImage: () => `https://mysite.com/api/og?title=${product.value.name}`
})
</script>
```

## Platform Specific Notes

### Facebook
- Uses [their own crawler](https://developers.facebook.com/docs/sharing/webmasters/crawler/)
- Cache time: ~30 days
- Force refresh: Use [Sharing Debugger](https://developers.facebook.com/tools/debug/)

### LinkedIn
- Aggressive caching (7+ days)
- Images must be public (no auth)
- Clear cache: [Post Inspector](https://www.linkedin.com/post-inspector/)

### Discord
- Real-time preview
- Supports animated GIFs
- No cache clearing needed

### Twitter (X)

- Prefers [Twitter Cards](/learn/mastering-meta/twitter-cards)
- Only uses og:image from OG tags
- Test with [Card Validator](https://cards-dev.twitter.com/validator)

## Testing & Verification

Always test your OG tags:

1. Use the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. Check [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
3. Share in Discord (real-time preview)

## Common Patterns

### Blog Posts

```ts
useSeoMeta({
  ogType: 'article',
  author: 'Harlan Wilton',
  // open graph
  articleAuthor: ['Harlan Wilton'],
  articleSection: 'SEO Tutorials for Vue and Nuxt',
  articleTag: page.value.keywords,
  articlePublishedTime,
  articleModifiedTime,
  // slack unfurling
  twitterData1: 'Harlan Wilton',
  twitterLabel1: 'Author',
  twitterData2: page.value.readTime,
  twitterLabel2: 'Read Time',
})
```

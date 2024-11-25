---
title: Schema.org in Vue & Nuxt
description: Schema.org can help search engines understand your content better, but is it worth the effort? Learn when to use it and when to skip it in Vue & Nuxt applications.
navigation:
  title: 'Schema.org'
publishedAt: 2024-11-05
updatedAt: 2024-11-05
readTime: 8 mins
keywords:
- schema.org vue
- json-ld
- structured data
- vue seo
---

## Introduction

In implementing Schema.org, we mostly care about [Rich Results](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) from Google as
they can help improve the visibility of your content in search results.

For example:
- [Article](https://developers.google.com/search/docs/data-types/article)
- [Breadcrumb](https://developers.google.com/search/docs/data-types/breadcrumb)
- [FAQ](https://developers.google.com/search/docs/data-types/faqpage)
- ..etc

Providing structured data can also help search engines understand your content better but in most cases, is unnecessary.

```html
<!-- This is what Schema.org looks like -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "When Schema.org Actually Matters",
  "author": "Your Name"
}
</script>
```

### Quick Facts

- **Focus on rich results**: Only implement Schema.org if you want a specific rich result type
- **Quality required**: Rich results need high-quality content that matches the markup

## Implementation With Vue

In Vue and Nuxt the head manager we use is called [Unhead](https://unhead.unjs.io/).

Using it we can either use `useHead()`{lang="ts"} to create Schema.org, however it's recommended to use the `useSchemaOrg()`{lang="ts"} composable as it provides type safety and creates [Schema.org graphs](https://schema.org/docs/data-and-datasets.html).

::code-group

```ts [useSchemaOrg]
useSchemaOrg([
  defineArticle({
    title: 'Schema.org in Vue & Nuxt',
    description: 'Schema.org can help search engines understand your content better, but is it worth the effort? Learn when to use it and when to skip it in Vue & Nuxt applications.',
  })
])
```

```ts [useHead]
useHead({
  scripts: [
    {
      type: 'application/ld+json',
      innerHTML: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Schema.org in Vue & Nuxt',
        'author': 'Your Name'
      }
    }
  ],
})
```

::

All we need to do is add the dependency to our project. For full install instructions see the [Install Unhead Schema.org](https://unhead.unjs.io/schema-org/getting-started/setup) documentation.

::code-group

```
yarn add -D @unhead/schema-org
```

```
npm install -D @unhead/schema-org
```

```
pnpm add -D @unhead/schema-org

```

::

The `useSchemaOrg()` composable supports any arbitrary schema.

```ts
useSchemaOrg([
  // passing json is fine
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Schema.org in Vue & Nuxt',
    'author': 'Your Name'
  }
])
```

It is best used when combined with the numerous `defineX()`{lang="ts"} helpers that provide a type-safe way to define schema
which aligns to Google's [Structured Data Guidelines](https://developers.google.com/search/docs/guides/sd-policies).

For example:
- [`defineArticle()`{lang="ts"}](https://unhead.unjs.io/schema-org/schema/article)
- [`defineBreadcrumb()`{lang="ts"}](https://unhead.unjs.io/schema-org/schema/breadcrumb)
- [`defineQuestion()`{lang="ts"}](https://unhead.unjs.io/schema-org/schema/question)

See the [Unhead Schema.org](https://unhead.unjs.io/schema-org/getting-started/setup) documentation for more details.

### Reactivity with `useSchemaOrg()`{lang="ts"}

The `useSchemaOrg()` composable accepts any reactive data you can throw at it.

```ts
const article = ref({
  title: 'Schema.org in Vue & Nuxt',
  description: 'Schema.org can help search engines understand your content better, but is it worth the effort? Learn when to use it and when to skip it in Vue & Nuxt applications.'
})

useSchemaOrg([
  defineArticle({
    // computed getter
    title: () => article.value.title,
    description: () => article.value.description,
  })
])
```

## Example: Generic Site Pages

For generic pages we can provide a minimal configuration that works across all pages.

```vue [app.vue]
<script lang="ts" setup>
import { defineOrganization, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'

// we can remove a lot of boilerplate from Schema.org by providing template params
const route = useRoute()
useHead({
  templateParams: {
    schemaOrg: {
      host: 'https://nuxtseo.com',
      path: route.path,
      inLanguage: 'en',
    }
  }
})

useSchemaOrg([
  // much of the data will be inferred such as the title, description and all URLs
  defineWebPage(),
  defineWebSite({
    name: 'Nuxt SEO',
    description: 'Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.',
  }),
  // choose an identity, either with definePerson or an defineOrganization
  defineOrganization({
    name: 'Nuxt SEO',
  })
])
</script>
```

The [Nuxt Schema.org](/docs/schema-org/getting-started/introduction) will set up these defaults for you.

## Example: Personal Blog

For a personal blog, we can provide more detailed information about the author.

```vue [app.vue]
<script lang="ts" setup>
import { definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'

useSchemaOrg([
  defineWebPage(),
  defineWebSite({
    name: 'My Blog',
    description: 'A blog about my life and experiences.',
  }),
  definePerson({
    name: 'Your Name',
    url: 'https://your-blog.com',
    image: 'https://your-blog.com/avatar.jpg',
    sameAs: [
      'https://twitter.com/your-twitter',
    ]
  }),
])
</script>
```

## Example: Blog

For a blog, we can provide more detailed information about the author and the blog.

As Vue is hierarchical, we don't need to define the `WebSite` and `WebPage` nodes in every component if they're defined in the layout.

```vue [blog/[article].vue]
<script lang="ts" setup>
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'

useSchemaOrg([
  defineArticle({
    // title and description will be inferred from the head tags
    image: '/photos/16x9/photo.jpg',
    datePublished: new Date(2020, 1, 1),
    dateModified: new Date(2020, 1, 1),
  })
])
</script>
```

---
title: How It Works
description: Learn more about how Nuxt Schema.org works.
---

Nuxt Schema.org will generate structured data for your site based on the input you provide and the content of your pages.

This is used to help search engines understand your content better and provide more relevant search results.

For a more technical details on how schema.org is generated, you can read the [official documentation](https://unhead.unjs.io/schema-org/getting-started/how-it-works).

## LD+JSON tag

The schema is injected within a `<script type="application/ld+json">` tag at the end of your document's `<body>`.

## Production Static data

When running in development this schema will be reactive to page changes, however when in production it will be static.

This is because robots will only ever parse the initial SSR response and not any client-side changes. To avoid the extra
bundle size required to generate schema.org on the frontend, it is only generated statically on the SSR response.

If you really need this behavior you can enable the `reactive` module config.

## Data Inferencing

To avoid much of the boilerplate associated with schema.org, Nuxt Schema.org will infer data from your pages.

For example, it will infer data from your head tags such as `title`, `description`, `keywords`, `author`, `date`, `image`, etc.

---
title: How It Works
description: Learn more about how Nuxt Simple Robots works.
---

The module main job is to tell robots (crawlers) how to behave.

Specifically, a main feature is to block Google from indexing pages that you don't want indexed.

Blocking Google from indexing pages is important for a number of reasons:
- Prevents [duplicate content issues](https://moz.com/learn/seo/duplicate-content)
- Prevents wasting [crawling budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)

While it does also attempt to control other robots, it is not always honored.

## Robots.txt

For robots to understand how they can access your site, they will first check for a `robots.txt` file.

```bash
public
 └── robots.txt
```

This file is accessed differently depending on your environment:
- When deploying using `nuxi generate` or the `nitro.prerender.routes` rule, this is a static file.
- Otherwise, it's handled by the server and generated at runtime when requested.

When indexing is disabled a `robots.txt` will be generated with the following content:

```
User-agent: *
Disallow: /
```

This blocks all bots from indexing your site.

## `X-Robots-Tag` Header and `<meta name="robots">`

In some situations, the robots.txt becomes too restrictive to provide the level of control you need to manage
your site's indexing.

For this reason, the module by default will provide a `X-Robots-Tag` header and `<meta name="robots">` tag.

These are applied using the following logic:
- `X-Robots-Tag` header - Route Rules are implemented for all modes, otherwise SSR only. This will only be added
when indexing has been disabled for the route.
- `<meta name="robots">` - SSR only, will always be added

## Robot Rules

Default values for the `robots` rule depending on the mode.

For indexable routes the following is used:

```html
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
```

Besides giving robots the go-ahead, this also requests that Google:

<blockquote>Choose the snippet length that it believes is most effective to help users discover your content and direct users to your site."</blockquote>

You can learn more on the [Robots Meta Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) documentation, feel free
to change this to suit your needs using `robotsEnabledValue`.

For non-indexable routes the following is used:

```html
<meta name="robots" content="noindex, nofollow">
```

This will tell robots to not index the page.

## Development Environment

The module by default will disable indexing in development environments. This is for safety, as you don't want
your development environment to be indexed by search engines.

```
# Block all bots
User-agent: *
Disallow: /
```

## Production Environments

For production environments, the module will generate a `robots.txt` file that allows all bots.

Out-of-the-box, this will be the following:

```
User-agent: *
Disallow:
```

This tells all bots that they can index your entire site.

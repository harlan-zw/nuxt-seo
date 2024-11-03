---
title: Conquering Web Crawlers (Robots) in Vue & Nuxt
description: Telling crawlers how to behave can help with your organic SEO growth and more, learn how to do it in Vue and Nuxt.
icon: i-noto-spider
navigation:
  title: 'Controlling Crawlers'
publishedAt: 2024-11-03
updatedAt: 2024-11-03
readTime: 10 mins
keywords:
  - vue
  - robots.txt
  - sitemap.xml
  - robots meta tag
  - canonical tag
---

## Introduction

A web crawler, also called a "spider" or a "robot", is simply a program scanning web pages for data.

While crawlers vary rapidly in complexity, we can build our own in one line of code.

::code-group

```bash [curl.sh]
curl https://nuxtseo.com -H "User-Agent: NuxtSEOBot"
```

```ts [fetch.ts]
fetch('https://nuxtseo.com', {
  headers: { 'User-Agent': 'NuxtSEOBot' }
})
```

::

Most crawlers will extract all links from the response and crawl all pages from there.

There are many categories of web crawler, for example:

### Search Engines

These crawlers are accessing your site to find pages that they can "index". An indexed page is one that will appear
in the search engine results page (SERP).

  - [Googlebot](https://developers.google.com/search/docs/advanced/crawling/overview-google-crawlers)
  - [Bingbot](https://ahrefs.com/seo/glossary/bingbot)

### Social

These crawlers are mostly accessing your site to generate previews when shared on their platform.

- [FacebookExternalHit](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/)
- [Twitterbot](https://www.linkedin.com/help/linkedin/answer/34394)
- [Discordbot](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started)

### AI Crawlers

These crawlers are accessing your site to generate content or data for their AI models.

- [GPTBot](https://platform.openai.com/docs/bots/overview-of-openai-crawlers)
- [Claude-Web](https://darkvisitors.com/agents/claude-web)

### Malicious Crawlers

While most of these crawlers can be good in the right context, some can be malicious or just not useful.

Malicious crawlers can easily mask the user agent of a regular user and ignore your robot rules while they search for
vulnerabilities or scrape your content.

::code-group

```bash [curl]
# Pretend to be a Chrome browser on Linux, see if they leaked their .env
curl https://nuxtseo.com/.env -H "User-Agent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'"
```

```ts [fetch]
// Pretend to be a Chrome browser on Linux, see if they leaked their .env
fetch('https://nuxtseo.com/.env', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  }
})
```

::

### Controlling Crawlers

Your site is most likely already getting thousands of these bot visits.

At a high level, we control these bots using:
- [`robots.txt`{lang="dir"}](https://developers.google.com/search/docs/crawling-indexing/robots/intro): Tells specific crawlers what they can and can't access.
- [`sitemap.xml`{lang="dir"}](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap): Tells crawlers what pages are on your site.
- [`<meta name="robots" content="...">`{lang="html"}](https://developers.google.com/search/docs/advanced/crawling/robots-meta): Tells search engine crawlers how to index your page.
- [`X-Robots-Tag`{lang="bash"}](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag): The same as the meta tag but sent as an HTTP header which is useful for files like PDFs.
- [`<link rel="canonical" href="...">`{lang="html"}](https://developers.google.com/search/docs/advanced/crawling/consolidate-duplicate-urls): Tells search engine crawlers which URL is the preferred version of a page.
- [HTTP Redirects](https://developer.mozilla.org/en-US/docs/Web/HTTP/Redirections): Redirect bots and keep your page SEO benefits
- [Web Application Firewall](https://en.wikipedia.org/wiki/Web_application_firewall): At a network level, identify and block malicious bots from accessing your site.

| Control Mechanism                                   | Best Used When |
|-----------------------------------------------------|----------------|
| [`robots.txt`](#using-robotstxt)                    | - Blocking large sections of your site (e.g., `/admin/*`)<br>- Managing crawler bandwidth on heavy pages<br>- Preventing crawling of development assets |
| [`<meta name="robots">`](#meta-robots-tag)          | - Controlling indexing for individual pages<br>- Managing dynamic content (search results, filtered pages)<br>- Setting page-specific crawler directives |
| [`X-Robots-Tag`](#x-robots-tag)                     | - Controlling non-HTML resources (PDFs, images)<br>- Managing API responses<br>- Setting crawler directives for files |
| [`<link rel="canonical">`](#canonical-links)        | - Managing duplicate content from URL parameters<br>- Consolidating mobile/desktop variants<br>- Handling cross-domain syndicated content |
| [HTTP Redirects](#http-redirects)                   | - Moving pages permanently (301 redirects)<br>- Preserving SEO value when restructuring<br>- Managing legacy URLs |
| [Web Application Firewall](#webapplicationfirewall) | - Blocking malicious bots<br>- Filtering high-volume crawler traffic<br>- Protecting against content scraping |

## Quick Implementation Guide

Need to set up crawler control quickly? Here's some recipes:

**Block a page from being indexed**

```vue [pages/secret.vue]
<script setup>
useSeoMeta({
  robots: 'noindex, follow'
})
</script>
```

**Avoid duplicate content issues**

```vue [pages/secret.vue]
<script setup>
useHead({
  // make sure you use an absolute URL
  link: [{ rel: 'canonical', href: 'https://mysite.com/secret' }]
})
</script>
```

**Block a group of pages**

```robots-txt [public/robots.txt]
User-agent: *
Disallow: /admin
```

**Redirect to a new URL**

```ts
export default defineNuxtConfig({
  routeRules: {
    '/old-url': {
      // keep SEO benefits by using a 301 redirect
      redirect: { to: '/new-url', statusCode: 301 }
    }
  }
})
```

## Why Control Crawlers?

Doing nothing about crawlers is a completely viable solution. You will not be inherently penalized for not managing them.

However, for some sites that are either looking to optimize their organic traffic, protect their content, or reduce server load, managing crawlers can be beneficial.

### Improve organic traffic

Making sure that only pages that should be on search engine result pages (SERP) are indexed may improve
your organic traffic.

This can especially be a problem when multiple pages are indexed with the same content, leading to duplicate content issues.

For example, having both `/about` and `/about/` without a canonical tag will cause them to be indexed separately,
which may cause them to compete against each other.

As search engine crawlers have a [crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) telling
them how to be more efficient can help them index more of your site more frequently.

Additionally, helping crawlers understand when you move or delete content using HTTP headers will make you don't lose
your search engine ranking.

### Protecting Content

Most sites will be operating with different environments such as testing, staging, and production.

By default, search engines will index any public environment they can access, this can lead to duplicate content issues and
confusion for end-users when these appear in the SERP.

Similarly, we may find our authenticated pages being indexed if we have public pages linking to them.

### Reducing server load

While costing almost nothing, you are effectively paying for CPU time everytime a bot visits your site. Filtering
incoming crawler requests can be an effective way to reduce server load.

This can be more apparent on pages that are expensive to render, such as pages with a lot of dynamic content or
pages using third-party services.

For example:
- You may be paying for crawlers to access your Google Maps embed
- Crawlers may be spending a long time in infinite scroll pages

## Using Robots.txt

The `robots.txt` file tells crawlers which parts of your site they can and can't access. It's placed your project's `public` directory.

**✅ Good for:**

- Blocking large site sections (e.g., /admin/*)
- Managing crawler bandwidth on heavy pages (e.g., search, infinite scroll)
- Preventing crawling of development assets

**❌ Don't use for:**

- Protecting sensitive data (crawlers can ignore rules)
- Individual page indexing (use meta robots instead)
- Removing existing pages from search results

Here's a minimal example:

::code-group

```robots-txt [Allow everything]
User-agent: * # Used as a wildcard for all crawlers.
Disallow: # An empty disallow means all pages are allowed.
```

```robots-txt [Block everything]
User-agent: * # Used as a wildcard for all crawlers.
Disallow: /
```

```robots-txt [Block a specific path]
User-agent: *
Disallow: /admin # blocks all pages under /admin, such as /admin/foo
```

::

Using Nuxt? Check out the [Nuxt Robots](/docs/robots/getting-started/introduction) module.

:ModuleCard{slug="robots" class="w-1/2"}

### Usage

- `User-Agent`: Specifies which crawler(s) the rules apply to
- `Allow`: Permits access to specific paths
- `Disallow`: Blocks access to specific paths
- `Sitemap`: Points to your sitemap.xml location

For a definitive guide on the robots.txt file, see Google's [Introduction to robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

### Important Notes

- It's publicly visible - avoid revealing sensitive URL patterns
- Not all crawlers follow the rules (consider using a [Web Application Firewall](https://en.wikipedia.org/wiki/Web_application_firewall))
- Don't block resources needed to render your pages (e.g., `/api`, `/assets`)

## Using Sitemaps

The `sitemap.xml` file is used to tell search engines what pages are on your site and how they are related to each other.

**✅ Good for:**

- Large sites (100+ pages)
- Frequently updated content
- Complex site structures
- New or job listing sites needing faster indexing

Considering the [Sitemap Paradox](https://webmasters.stackexchange.com/questions/4803/the-sitemap-paradox), you don't need a Sitemap, however, Google does recommend using one and it can only benefit your site.

::code-group

```xml [Basic Sitemap]
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com/</loc>
  </url>
</urlset>
```

```xml [Loc Data]
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com/</loc>
    <lastmod>2022-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

```xml [Multipel loc]
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com/</loc>
  </url>
  <url>
    <loc>https://mysite.com/about</loc>
  </url>
  <url>
    <loc>https://mysite.com/contact</loc>
  </url>
</urlset>
```

::

Using Nuxt? Check out the Nuxt Sitemap module.
:ModuleCard{slug="sitemap" class="w-1/2"}

### Usage

The `urlset` tag is the root element of the sitemap and contains one or more `url` tags which has the following
sub-elements:

- `loc`: The URL of the page (required)
- `lastmod`: When the page was last modified
- `changefreq`: How often the page changes
- `priority`: Relative importance (0.0 to 1.0)

Note: Google only uses the lastmod tag - changefreq and priority are ignored.

For more complex Sitemaps, you should reference the relevant [Sitemaps.org](https://www.sitemaps.org/protocol.html) documentation
and [Google's Sitemap Guidelines](https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap).

**Important Notes**

- URLs within your sitemap must match your [canonical tag](#canonical-tag-in-vue--nuxt) exactly (if you provide one)
- Limited to 50,000 URLs per sitemap then you must use a sitemap index
- Must be in UTF-8 encoding
- Best to generate programmatically instead of manually maintaining

### Quick Setup

The simplest implementation of a `sitemap.xml` file would look like the below.

```xml [/sitemap.xml]
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mysite.com/</loc>
  </url>
</urlset>
```

It's good practice to programmatically generate the sitemap.xml file as it can be a lot of work to maintain manually.

You can create this file in the `public` directory of your project.

```dir
public/
  sitemap.xml
```

It's important to link your sitemap.xml file in your `robots.txt` file.

```robots-txt [robots.txt]
# Allow everything
User-agent: *
Disallow:

Sitemap: https://mysite.com/sitemap.xml
```

Once your `sitemap.xml` is deployed you can submit it to Google Search Console and Bing Webmaster Tools.

## Meta Robots Tag

The `<meta name="robots" content="...">`{lang="html"} meta tag is used to configure the indexing behaviour of a page.

**✅ Use for:**

- Page-specific indexing control (e.g., out-of-stock products)
- Dynamic content (e.g., search results, filtered pages)
  ❌ Don't use for:

**❌ Don't use for:**

- Non-HTML resources - use X-Robots-Tag instead
- Site-wide rules - use robots.txt instead

::code-group

```html [Allow Indexing]
<meta name="robots" content="index, follow">
```

```html [Block Indexing]
<meta name="robots" content="noindex, follow">
```

::

### Usage

There are [several directives](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#directives) that can be useful
for different scenarios.

The directives are as follows:
- `noindex`: Tells the crawler not to show the page in search results
- `nofollow`: Tells the crawler not to follow links on the page
- `noarchive`: Tells the crawler not to store a cached version of the page
- `nosnippet`: Tells the crawler not to show a snippet of the page in search results
- `max-snippet`: The maximum length of a snippet shown in search results
- `max-image-preview`: The maximum size of an image preview shown in search results
- `max-video-preview`: The maximum size of a video preview shown in search results
- `unavailable_after`: The date and time the page should no longer be shown in search results
- `follow`: Tells the crawler to follow links on the page
- `index`: Tells the crawler to show the page in search results

### Important Notes

- Must be server-side rendered if you want it to be respected by crawlers
- Must be in your `<head>` tag

### Quick Setup

As you're using either Vue or Nuxt, you can make use of [Unhead](https://unhead.unjs.io/) to add the meta tag to your pages
using `useHead()`{lang="ts"} or `useSeoMeta()`{lang="ts"}.

The below rule will stop the page being shown in search results but will allow the crawler to follow links on it find other pages.

::code-group

```ts [useSeoMeta]
useSeoMeta({
  robots: 'noindex, follow'
})
```

```ts [useHead]
useHead({
  meta: [
    { name: 'robots', content: 'noindex, follow' }
  ]
})
```

```ts [Nuxt Robots]
useRobotsRule(false)
```

::

## X-Robots-Tag

The `X-Robots-Tag` is an HTTP header that controls how search engines handle non-HTML resources like PDFs, images, and API responses. It
shares the same directives as the meta robots tag.

**✅ Use for:**

- Any non-HTML file: PDF, documents, images, etc
- API responses

**❌ Don't use for:**

- Site-wide rules (use robots.txt instead)
- Blocking specific crawlers (use robots.txt instead)

### Quick Setup

::code-group

```ts [Nuxt Config]
export default defineNuxtConfig({
  routeRules: {
    '/downloads/**': {
      headers: {
        'X-Robots-Tag': 'noindex'
      }
    }
  }
})
```

```ts [Server Middleware]
import { setHeader } from 'h3'

export default defineEventHandler((e) => {
  if (e.path.endsWith('.pdf')) {
    setHeader(e, 'X-Robots-Tag', 'noindex')
  }
})
```

```ts [Server Middleware - Nuxt Robots]
import { useRobotsRule } from '#imports'

export default defineEventHandler((e) => {
  if (e.path.endsWith('.pdf')) {
    useRobotsRule(false)
  }
})
```

::

### Important Notes

- Takes precedence over meta robots tags

## Canonical Links

A canonical link tells search engines which URL is the "main" version of a page when similar content exists at multiple URLs.

```html
<link rel="canonical" href="https://mysite.com/page">
```

**✅ Good for:**

- URLs with query parameters (e.g., filters, sorting)
- Mobile/desktop variations
- HTTP/HTTPS duplicates
- Printer-friendly pages
- Cross-domain syndicated content
- Paginated content

**❌ Don't use for:**

Entirely different content
Redirected pages (use 301 redirects)
Blocked pages (noindex)

### Quick Setup

In Vue/Nuxt, you can set canonical links using composables:

```ts
useHead({
  link: [
    {
      rel: 'canonical',
      href: 'https://mysite.com/products/phone'
    }
  ]
})
```

Using Nuxt? The SEO Utils module provides automatic canonical URL handling:

```ts
export default defineNuxtConfig({
  site: {
    url: 'https://mysite.com'
  },
  seo: {
    // Ignore certain query params
    canonicalQueryParams: ['page', 'size']
  }
})
```

:ModuleCard{slug="seo-utils" class="w-1/2"}

### Important Notes

- Must use absolute URLs
- Only one canonical per page
- Self-referential canonicals are OK
- Query parameters can be included or excluded
- Search engines treat as a suggestion, not a directive
- Should be server-side rendered

## HTTP Redirects

HTTP redirects tell crawlers (and users) that a page has moved to a new location. They're essential for maintaining SEO value when restructuring your site.

**✅ Good for:**

- Preserving SEO rankings during site migrations
- Managing URL structure changes
- Handling legacy or outdated URLs
- Consolidating duplicate content

**❌ Don't use for:**

- Temporary content changes (use 302 instead of 301)
- Replacing proper canonical tags
- Cross-domain content sharing (use canonical)

### Quick Setup

To redirect we need access to the server serving the request. In Nuxt we have full control of this, in other
Vue setups you will need to configure your server to handle these redirects.

In Nuxt, you can implement redirects using route rules, middleware or on the page.

::code-group

```ts [Route Rules]
export default defineNuxtConfig({
  routeRules: {
    '/old-page': { redirect: '/new-page' },
    '/blog/:slug': { redirect: '/articles/:slug' }
  }
})
```

```ts [Middleware]
import { sendRedirect } from 'h3'

export default defineEventHandler((e) => {
  if (e.path === '/old-page') {
    sendRedirect(e, 'new-page', 301)
  }
})
```

```vue [Page]
<script setup lang="ts">
// old-page.vue
navigateTo('/new-page', {
  redirectCode: 301
})
</script>
```

::

Usage
Common redirect status codes:

- `301`{lang="ts"}: Permanent redirect - transfers SEO value
- `302`{lang="ts"}: Temporary redirect - keeps SEO value on original URL
- `307`{lang="ts"}: Temporary redirect (preserves HTTP method)
- `308`{lang="ts"}: Permanent redirect (preserves HTTP method)

### Important Notes

- Use 301s for permanent moves to pass SEO value
- Avoid redirect chains (A → B → C)
- Keep redirects active for at least 6 months
- Monitor redirects in Search Console for errors
- Implement redirects server-side when possible

## Web Application Firewall

A Web Application Firewall (WAF) provides network-level control over crawler access to your site. Unlike other controls, WAFs can actively identify and block malicious crawlers.

**✅ Good for:**

- Blocking malicious bots and scrapers
- Protecting against DDoS attacks
- Rate limiting aggressive crawlers

**❌ Don't use for:**

- Managing search engine crawlers (use robots.txt)
- Page-level indexing control (use meta robots)
- URL management (use redirects/canonicals)

Most cloud providers offer WAF solutions, for example [Cloudflare's Web Application Firewall](https://developers.cloudflare.com/waf/).

## Testing Your Configuration

The fastest way to verify your crawler configuration is using Google Search Console's URL Inspection tool.

### Using URL Inspection

1. Go to Google Search Console
2. Click "URL Inspection" in the top bar
3. Enter your page URL
4. Check these key areas:
  - Coverage: Is the page indexed?
  - Crawl: Can Googlebot access the page?
  - Indexing: Are your robots directives working?
  - Canonical: Is your canonical URL recognized?

### Quick Checks

TODO

### Important Notes

- Changes can take hours to appear in URL Inspection
- Test on both mobile and desktop versions
- Verify across different page types (home, products, blog, etc.)
- Check both staging and production environments
- Monitor Search Console for crawl errors

For complete testing documentation, see Google's URL Inspection Tool guide.

## Common Patterns

### Allow Indexing with full snippets

```ts
useSeoMeta({
  robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
})
```

This will allow the page to be indexed and not restrict the snippet length, but will limit the image and video previews.

### Block Non-Production Sites

This must be done at a serve level by swapping out the robots.txt response or using a middleware.

::code-group

```robots [robots.txt]
User-agent: *
Disallow: / # Make sure this is only served from your non-production sites
```

```ts [Nuxt]
// server/middleware/block-non-production.ts
import { getRequestHost, setHeader } from 'h3'

export default defineEventHandler((event) => {
  if (getRequestHost(event).includes('staging.')) {
    setHeader('noindex, nofollow')
  }
})
```

::

Tip: [Nuxt Robots]() can handle this for you.

### Search & Filter Pages

```ts
// pages/search.vue
const { query, filters } = useRoute().query

// Block indexing of search results and filtered pages
useHead({
  meta: [
    {
      name: 'robots',
      content: 'noindex, follow' // allow following links to products/content
    }
  ],
  // Point to main category/listing page as canonical
  link: [
    {
      rel: 'canonical',
      href: 'https://mysite.com/products'
    }
  ]
})
```

### Pagination Handling

```ts
// pages/blog/[page].vue
const { page } = useRoute().params

useSeoMeta({
  // Only index first page of paginated content
  robots: page === '1' ? 'index, follow' : 'noindex, follow',
  // Point all pages to first page as canonical
  canonical: 'https://mysite.com/blog'
})
```

### Temporary Content

```ts
// pages/sales/[campaign].vue
const campaignEnd = new Date('2024-12-31')

useSeoMeta({
  // Stop indexing after campaign ends
  robots: `index, follow, unavailable_after: ${campaignEnd.toISOString()}`
})
```

### Redirect old domain to new

```ts [server/middleware/host-redirect.ts
export default defineEventHandler((e) => {
  if (getRequestHost(e) === 'oldsite.com') {
    sendRedirect(e, 'newsite.com', 301)
  }
})
```

### Block Commercial & Scraping Bots

```robots-txt [robots.txt]
User-agent: *
Disallow:

# commercial bots
User-agent: AhrefsBot
Disallow: /
User-agent: Barkrowler
Disallow: /
User-agent: CriteoBot
Disallow: /
User-agent: DotBot
Disallow: /
User-agent: GrapeshotCrawler
Disallow: /
User-agent: IAS Crawler
Disallow: /
User-agent: MJ12bot
Disallow: /
User-agent: SirdataBot
Disallow: /
User-agent: TTD-Content
Disallow: /
User-agent: Uptimebot
Disallow: /
User-agent: Verity
Disallow: /
User-agent: admantx
Disallow: /
User-agent: proximic
Disallow: /
User-agent: trendiction
Disallow: /

# ai content scraping bots
User-Agent: Applebot
Disallow: /
User-Agent: FacebookBot
Disallow: /
User-agent: Amazonbot
Disallow: /
User-agent: Bytespider
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: ChatGPT-User
Disallow: /
User-agent: Claude-Web
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: GPTBot
Disallow: /
User-agent: PerplexityBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
```

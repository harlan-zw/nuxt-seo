---
name: nuxtjs-seo
description: Install, configure, and debug the @nuxtjs/seo meta module, which installs robots, sitemap, OG image, Schema.org, SEO utils, link checker, and site config in one Nuxt module. Use when a task mentions @nuxtjs/seo, Nuxt SEO, `nuxt module add seo`, disabling one SEO submodule, which config key owns an option, @nuxtjs/seo/content, a "takumi renderer missing dependencies" build error, or missing robots.txt and sitemap.xml after install.
---

# @nuxtjs/seo

Tested against `@nuxtjs/seo` 5.3.16 plus the fixes from harlan-zw/nuxt-seo#633 and #634, on Nuxt 4.5.2.
The package declares Nuxt `moduleDependencies`, and Nuxt installs each submodule.
Setup checks the Nuxt version and each loaded submodule version.
In development, the first successful home page response starts one background setup report.
The report includes required fixes, optional tips, and enabled or disabled module states.
It also supports locale prefixes and app base paths.
Each Nitro server instance reports once. A server rebuild can report again.
Unavailable module data stays unchecked. Open DevTools to retry.
Production does not register this runtime check.
Every option, composable, and component comes from a submodule. Docs: https://nuxtseo.com/docs/nuxt-seo

This Skill covers only what the bundle adds. For one module, use its own Skill or docs (table below).

## Setup

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: {
    url: 'https://example.com',
    name: 'My Site',
  },
})
```

- Add only `@nuxtjs/seo` to `modules`. Do not also list the submodules; Nuxt installs each one once.
- Set `site.url` and `site.name`. Since v5, site config does not infer them from `package.json`.
- If the app keeps OG images, install a renderer. See the first trap.

## Which module owns which option

The meta module has one option, `nuxtseo.enabled`. Every other top level key belongs to one submodule.

| Key | Package | Reference |
|---|---|---|
| `site` | `nuxt-site-config` | [skilld.dev/gh/harlan-zw/nuxt-site-config](https://skilld.dev/gh/harlan-zw/nuxt-site-config) |
| `robots` | `@nuxtjs/robots` | https://nuxtseo.com/docs/robots |
| `sitemap` | `@nuxtjs/sitemap` | https://nuxtseo.com/docs/sitemap |
| `ogImage` | `nuxt-og-image` | https://nuxtseo.com/docs/og-image |
| `schemaOrg` | `nuxt-schema-org` | [skilld.dev/gh/harlan-zw/nuxt-schema-org](https://skilld.dev/gh/harlan-zw/nuxt-schema-org) |
| `seo` | `nuxt-seo-utils` | [skilld.dev/gh/harlan-zw/nuxt-seo-utils](https://skilld.dev/gh/harlan-zw/nuxt-seo-utils) |
| `linkChecker` | `nuxt-link-checker` | [skilld.dev/gh/harlan-zw/nuxt-link-checker](https://skilld.dev/gh/harlan-zw/nuxt-link-checker) |

The `seo` key configures `nuxt-seo-utils`, not the bundle.
`nuxtseo: false` or `nuxtseo: { enabled: false }` installs no bundled submodule. See "Disable a submodule".

## Automatic behaviour

With only `site.url` and `site.name` set, a production build gives:

- `/robots.txt` that allows all and links the sitemap, plus `<meta name="robots">` on each page (robots).
- `/sitemap.xml` with every static route (sitemap).
- Title template `%s | My Site`, canonical link, `og:url`, `og:site_name`, and `og:title` and `og:description` inferred from the page (SEO utils).
- A JSON-LD graph with `WebSite` and `WebPage` (Schema.org).
- In dev, `/robots.txt` disallows all crawlers. Check indexing on a production build.
- A link check that runs on prerender (`nuxt generate` or prerendered routes). A plain `nuxt build` does not run it.

## Disable a submodule

Set the submodule key to `false`, or set `enabled: false` in it:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
  ogImage: false,
  linkChecker: { enabled: false },
})
```

`false` skips the module setup. `enabled: false` runs a setup that registers nothing. Both remove the routes, tags, and output of that module.
You cannot disable `site`. The other submodules need it.
To drop the whole bundle, set `nuxtseo: false`, or remove `@nuxtjs/seo` from `modules`. A submodule that you list in `modules` yourself still installs.

## Add a standalone module

`nuxt-ai-ready` and `nuxt-skew-protection` are optional dependencies of the bundle. Installing the package is not enough; add it to `modules`:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo', 'nuxt-ai-ready'],
})
```

## Nuxt Content v3

Import the four schema helpers from `@nuxtjs/seo/content`.
With pnpm, a direct import from `@nuxtjs/robots/content` fails with `ERR_MODULE_NOT_FOUND`, because the submodules are not top level dependencies.
Add `zod` to the app dependencies. The helpers import `zod` as an optional peer, and without it the import fails.

```ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '@nuxtjs/seo/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        robots: defineRobotsSchema(),
        sitemap: defineSitemapSchema(),
        ogImage: defineOgImageSchema(),
        schemaOrg: defineSchemaOrgSchema(),
      }),
    }),
  },
})
```

`schemaOrg` and `sitemap` frontmatter apply without page code.
`robots` frontmatter applies only if the page passes `page.seo` to `useSeoMeta()`:

```vue
<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('content').path(route.path).first())
useSeoMeta(page.value?.seo || {})
</script>
```

The order of `@nuxtjs/seo` and `@nuxt/content` in `modules` does not change the output.

Breaking change in v5: `asSeoCollection()` is deprecated and warns at build. Old: `defineCollection(asSeoCollection({ ... }))`. New: the `schema` above.

## Traps

- **In an Agent shell, a fresh install fails `nuxt build`.** `nuxt-og-image` defaults to the takumi renderer and throws `takumi renderer missing dependencies: @takumi-rs/core`. It detects the Agent from environment variables such as `CLAUDECODE` and `AI_AGENT`. Outside an Agent it only logs the error, and the build passes. Fix: add `@takumi-rs/core` to the app, or set `ogImage: false`.
- **In an Agent shell, `nuxt dev` tries to install `@takumi-rs/core` into the app.** If the install fails, the dev server exits. Decide on OG images before the first dev run.
- **A submodule in the app `package.json` replaces the bundled copy.** Nuxt loads the app copy. If it is older than the bundle requires, the build stops with `[@nuxtjs/seo] Module @nuxtjs/sitemap version (7.3.1) does not satisfy >=7.4 (requested by @nuxtjs/seo).` Upgrade the pin or remove it.
- **`@nuxtjs/i18n` below v10 fails every build.** The error is `Module @nuxtjs/i18n version (9.x) does not satisfy >=10.0 (requested by @nuxtjs/seo)`. Upgrade i18n.
- **Content `robots: 'noindex'` keeps the page in the sitemap.** Only `robots: false` removes it from `/sitemap.xml`. Both render `noindex, nofollow`.

## Version limits

- Nuxt 3.21.11 or later, or Nuxt 4.1 or later. Earlier versions fail with `[@nuxtjs/seo] Nuxt 4.0.3 is unsupported. Upgrade Nuxt to ^3.21.11 || >=4.1.0.` Upgrade Nuxt.
- v5 moved every submodule up one major, except OG image. Migration: https://nuxtseo.com/docs/nuxt-seo/migration-guide/v4-to-v5

## Debug

- If a version error names a submodule, run `pnpm why <package>` to find what pins the older copy.

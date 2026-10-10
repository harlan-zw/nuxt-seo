---
name: nuxtjs-seo
description: Install, configure, and debug the @nuxtjs/seo meta module, which installs robots, sitemap, OG image, Schema.org, SEO utils, link checker, site config, AI Ready, and Skew Protection. Use when a task mentions @nuxtjs/seo, Nuxt SEO, `nuxt module add seo`, disabling one SEO submodule, which config key owns an option, @nuxtjs/seo/content, a "takumi renderer missing dependencies" build error, or missing robots.txt and sitemap.xml after install.
license: MIT
compatibility: "Requires a project using @nuxtjs/seo. Requires Node.js ^22.22.3 || ^24.15.0 || >=26.0.0. Requires Nuxt ^4.6.0 || ^5.0.0."
---

# @nuxtjs/seo

Requires Nuxt `^4.6.0 || ^5.0.0` and Node `^22.22.3 || ^24.15.0 || >=26.0.0`. The package declares Nuxt `moduleDependencies`; Nuxt installs each submodule, and setup checks versions.

In human dev sessions, the first successful home page response starts background setup checks; the report lists required fixes, optional tips, and module states. Required findings report once per Nitro server instance; agent and CI sessions skip terminal checks; production registers no runtime check. Locale prefixes and app base paths are supported.

Only required setup affects warnings and completion; DevTools shows tips separately. Tips use resolved defaults and app config, expose opt-in features, and exclude runtime inline minification and general SEO advice. Explicit opt-outs suppress the related tip; unavailable data stays unchecked until a DevTools retry.

Tips report at most once per seven days per project; state lives in the build directory, default `.nuxt/cache/nuxt-seo/setup-tips.json`; deleting it resets the cooldown. `nuxtseo: { tips: false }` disables tips in terminal and DevTools; required checks stay active. Healthy projects without eligible tips report nothing.

Every option, composable, and component comes from a submodule. Docs: nuxtseo.com/docs/nuxt-seo. This Skill covers only what the bundle adds; for one module, use its own Skill or docs (list below).

## Setup

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
})
```

- Add only `@nuxtjs/seo` to `modules`; do not also list submodules, Nuxt installs each once.
- Set `site.url` and `site.name`; since v5, site config does not infer them from `package.json`.
- If the app keeps OG images, install a renderer. See the first trap.

## Option ownership

The meta module owns only `nuxtseo.enabled` and `nuxtseo.tips`. Other top level keys belong to submodules:

- `site`: `nuxt-site-config` (skilld.dev/gh/harlan-zw/nuxt-site-config)
- `robots`: `@nuxtjs/robots` (nuxtseo.com/docs/robots)
- `sitemap`: `@nuxtjs/sitemap` (nuxtseo.com/docs/sitemap)
- `ogImage`: `nuxt-og-image` (nuxtseo.com/docs/og-image)
- `schemaOrg`: `nuxt-schema-org` (skilld.dev/gh/harlan-zw/nuxt-schema-org)
- `seo`: `nuxt-seo-utils` (skilld.dev/gh/harlan-zw/nuxt-seo-utils)
- `linkChecker`: `nuxt-link-checker` (skilld.dev/gh/harlan-zw/nuxt-link-checker)
- `aiReady`: `nuxt-ai-ready` (nuxtseo.com/docs/ai-ready)
- `skewProtection`: `nuxt-skew-protection` (nuxtseo.com/docs/skew-protection)

The `seo` key configures `nuxt-seo-utils`, not the bundle. `nuxtseo: false` or `nuxtseo: { enabled: false }` installs no bundled submodule (see "Disable a submodule").

## Automatic behaviour

With only `site.url` and `site.name` set, a production build gives, for example:

- `/robots.txt` allowing all and linking the sitemap, plus `<meta name="robots">` per page (robots).
- `/sitemap.xml` with every static route (sitemap).
- Title template `%s | My Site`, canonical link, `og:url`, `og:site_name`, `og:title`/`og:description` inferred from the page (SEO utils).
- A JSON-LD graph with `WebSite` and `WebPage` (Schema.org).
- In dev, `/robots.txt` disallows all crawlers; check indexing on a production build.
- A link check on prerender (`nuxt generate` or prerendered routes); a plain `nuxt build` does not run it.

## Disable a submodule

`false` skips module setup; `enabled: false` runs setup that registers nothing. Both remove that module's routes, tags, and output:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
  ogImage: false,
  linkChecker: { enabled: false },
})
```

You cannot disable `site`; the other submodules need it. To drop the whole bundle, set `nuxtseo: false` or remove it from `modules`. A submodule listed in `modules` yourself still installs.

## AI Ready and Skew Protection

Both install automatically. Remove duplicate `modules` entries when upgrading from v5; keep existing `aiReady` and `skewProtection` options.

- AI Ready serves Markdown and `llms.txt`; prerendering also generates `llms-full.txt`. Databases, background indexing, and cron remain opt-in. The bundle disables project agent skills and API catalogs; configure them to publish.
- Skew Protection uses native polling and disables version cookies. Explicit site options take precedence. Retained assets need persistent build storage: preserve `node_modules/.cache/nuxt-seo/skew-protection` in CI or configure shared storage. If server handlers use `isClientOutdated`, opt into `skewProtection.cookie` with a config object.
- Set `aiReady: false` or `skewProtection: false` to disable either module.

## Nuxt Content v3

Import the four schema helpers from `@nuxtjs/seo/content`. With pnpm, importing from `@nuxtjs/robots/content` fails `ERR_MODULE_NOT_FOUND`: submodules are not top level dependencies. Add `zod` to the app dependencies; the helpers import it as an optional peer.

```ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '@nuxtjs/seo/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: { content: defineCollection({
    type: 'page',
    source: '**/*.md',
    schema: z.object({
      robots: defineRobotsSchema(),
      sitemap: defineSitemapSchema(),
      ogImage: defineOgImageSchema(),
      schemaOrg: defineSchemaOrgSchema(),
    }),
  }) },
})
```

`schemaOrg` and `sitemap` frontmatter apply without page code. `robots` frontmatter applies only if the page passes `page.seo` to `useSeoMeta()`:

```vue
<script setup lang="ts">
const { data: page } = await useAsyncData('page', () => queryCollection('content').path(useRoute().path).first())
useSeoMeta(page.value?.seo || {})
</script>
```

The `modules` order of `@nuxtjs/seo` and `@nuxt/content` does not change output.
Breaking in v5: `asSeoCollection()` is deprecated and warns at build. Old: `defineCollection(asSeoCollection({ ... }))`. New: the `schema` above.

## Traps

- **In an Agent shell, a fresh install fails `nuxt build`.** `nuxt-og-image` defaults to the takumi renderer and throws `takumi renderer missing dependencies: @takumi-rs/core`. Agent detection reads env vars such as `CLAUDECODE` and `AI_AGENT`; outside an Agent it only logs the error and the build passes. Fix: add `@takumi-rs/core`, or set `ogImage: false`.
- **In an Agent shell, `nuxt dev` tries to install `@takumi-rs/core` into the app.** If it fails, the dev server exits; decide on OG images before the first dev run.
- **A submodule in the app `package.json` replaces the bundled copy.** If older than the bundle requires, the build stops with `[@nuxtjs/seo] Module @nuxtjs/sitemap version (7.3.1) does not satisfy >=7.4 (requested by @nuxtjs/seo).` Upgrade the pin or remove it.
- **`@nuxtjs/i18n` below v10 fails every build** with `Module @nuxtjs/i18n version (9.x) does not satisfy >=10.0 (requested by @nuxtjs/seo)`. Upgrade i18n.
- **Content `robots: 'noindex'` keeps the page in the sitemap.** Only `robots: false` removes it from `/sitemap.xml`. Both render `noindex, nofollow`.

## Version limits

- Nuxt `^4.6.0 || ^5.0.0`; earlier versions fail Nuxt module compatibility.
- v5 moved every submodule up one major, except OG image. Migration: nuxtseo.com/docs/nuxt-seo/migration-guide/v4-to-v5
- On a submodule version error, run `pnpm why <package>` to find the older pin.

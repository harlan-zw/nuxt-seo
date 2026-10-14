---
name: nuxtjs-seo
description: Install, configure, and debug the @nuxtjs/seo meta module, which installs robots, sitemap, OG image, Schema.org, SEO utils, link checker, site config, AI Ready, and Skew Protection. Use when a task mentions @nuxtjs/seo, Nuxt SEO, `nuxt module add seo`, disabling one SEO submodule, which config key owns an option, @nuxtjs/seo/content, an OG image renderer or `NUXT_APP_SECRET` error, upgrading from Nuxt SEO v5, or missing robots.txt and sitemap.xml after install.
license: MIT
compatibility: "Requires Node.js ^22.22.3 || ^24.15.0 || >=26.0.0. Requires Nuxt ^4.6.1 || ^5.0.0."
---

# @nuxtjs/seo

Requires Nuxt `^4.6.1 || ^5.0.0` and Node `^22.22.3 || ^24.15.0 || >=26.0.0`. Nuxt installs declared `moduleDependencies` and checks versions.

In human dev, the first home response checks fixes, tips, and modules. Required findings report once per Nitro server instance; agent/CI skip terminal checks; production registers none. Locale prefixes and app base paths work.

Only required setup affects warnings and completion; DevTools shows tips separately. Tips use resolved defaults and app config for opt-in features, excluding inline minification and general SEO advice. Opt-outs suppress tips; unavailable data waits for retry.

Tips report weekly per project. State is `.nuxt/cache/nuxt-seo/setup-tips.json`; deleting resets it. `nuxtseo: { tips: false }` disables tips, not required checks. Healthy projects without tips report nothing.

Options, composables, and components come from submodules. Docs: nuxtseo.com/docs/nuxt-seo. This Skill covers bundle additions; use each module's Skill or docs below.

## Setup

```bash
npx nuxt module add seo
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
})
```

- Add only `@nuxtjs/seo` to `modules`; Nuxt installs submodules once.
- Set `site.url` and `site.name`; v5 stopped inferring them from `package.json`.
- Set `NUXT_APP_SECRET` in production; see the `NUXT_APP_SECRET` trap.
- If the app needs OG images, install a renderer: `npx nuxt-og-image enable takumi`. See the renderer traps.

## Automatic behaviour

With `site.url` and `site.name`, production, for example, adds allowing `/robots.txt`, sitemap, and per-page robots meta; static routes in `/sitemap.xml`; title, canonical, and page Open Graph metadata; `WebSite`/`WebPage` JSON-LD; `/llms.txt` and Markdown pages; retained assets with app-manifest polling. Dev robots disallows all. Link checks run only on prerender.

## Option ownership

The meta module owns only `nuxtseo.enabled` and `nuxtseo.tips`:

- `site`: `nuxt-site-config` (skilld.dev/gh/harlan-zw/nuxt-site-config)
- `robots`: `@nuxtjs/robots` (nuxtseo.com/docs/robots)
- `sitemap`: `@nuxtjs/sitemap` (nuxtseo.com/docs/sitemap)
- `ogImage`: `nuxt-og-image` (nuxtseo.com/docs/og-image)
- `schemaOrg`: `nuxt-schema-org` (skilld.dev/gh/harlan-zw/nuxt-schema-org)
- `seo`: `nuxt-seo-utils` (skilld.dev/gh/harlan-zw/nuxt-seo-utils)
- `linkChecker`: `nuxt-link-checker` (skilld.dev/gh/harlan-zw/nuxt-link-checker)
- `aiReady`: `nuxt-ai-ready` (nuxtseo.com/docs/ai-ready)
- `skewProtection`: `nuxt-skew-protection` (nuxtseo.com/docs/skew-protection)

`seo` configures `nuxt-seo-utils`, not the bundle. `nuxtseo: false` or `nuxtseo: { enabled: false }` installs no submodule.

## Disable a submodule

`false` skips setup; `enabled: false` registers nothing. Both remove the module's routes, tags, and output:

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],
  site: { url: 'https://example.com', name: 'My Site' },
  ogImage: false,
  linkChecker: { enabled: false },
})
```

You cannot disable `site`; other submodules need it. To drop the bundle, set `nuxtseo: false` or remove it from `modules`. A submodule you list still installs.

## AI Ready and Skew Protection

Both install automatically. On v5 upgrade, remove duplicate `modules` entries; keep their options.

- AI Ready serves Markdown and `llms.txt`; prerendering adds `llms-full.txt`. It publishes project/layer Agent Skills at `public/skills/<name>/SKILL.md`, not root `skills/`; MCP plus site URL generates an API catalog. Databases, background indexing, and cron are opt-in. Set either `aiReady.agentSkills` or `aiReady.apiCatalog` to `false`.
- The bundle sets Skew Protection `updateStrategy: 'polling'` and `cookie: false`; site options win. Preserve `node_modules/.cache/nuxt-seo/skew-protection` in CI or set `skewProtection.storage`. Handlers using `isClientOutdated` need a `skewProtection.cookie` config object.
- Set `aiReady: false` or `skewProtection: false` to disable either module.

## Nuxt Content v3

Import four helpers from `@nuxtjs/seo/content`. With pnpm, `@nuxtjs/robots/content` fails `ERR_MODULE_NOT_FOUND` because submodules are not top-level dependencies. Add `zod` 4; helpers use it as an optional peer.

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

`schemaOrg` and `sitemap` apply without page code. `robots` needs `page.seo` passed to `useSeoMeta()`:

```vue
<script setup lang="ts">
const { data: page } = await useAsyncData('page', () => queryCollection('content').path(useRoute().path).first())
useSeoMeta(page.value?.seo || {})
</script>
```

`@nuxtjs/seo` and `@nuxt/content` order does not change output. v6 removes `asSeoCollection()`: replace `defineCollection(asSeoCollection({ ... }))` with the `schema` above.

## Traps

- **Production OG images return 500 without `NUXT_APP_SECRET`.** Only `/_og/` fails; pages render. Dev creates a temporary secret, builds do not. Run `npx nuxt-og-image generate-secret`; set a 32+ character production secret. Static and `ogImage: { zeroRuntime: true }` need none.
- **Fresh install has no OG images without a template or renderer.** Run `npx nuxt-og-image enable takumi`, or set `ogImage: false`.
- **A template renderer is missing.** Interactive `nuxt dev` asks to install it. CI and Agent shells log `npx nypm add`, never edit `package.json`; production build then fails if used.
- **An app submodule replaces the bundled copy.** An old pin stops build; upgrade or remove it.
- **`@nuxtjs/i18n` below v10 fails every build.** Upgrade i18n.
- **Content `robots: 'noindex'` stays in the sitemap.** Only `robots: false` removes it; both render `noindex, nofollow`.

## Version limits

- Nuxt `^4.6.1 || ^5.0.0`; older versions stop build. Run `npx nuxt upgrade`. Nuxt 3 stays on v5.
- Nuxt Content v2 is not supported; use Content v3 with Zod 4.
- v6 moves every submodule up one major and bundles AI Ready and Skew Protection. Migration: nuxtseo.com/docs/nuxt-seo/migration-guide/v5-to-v6
- For bundled modules, pins, `NUXT_APP_SECRET`, DevTools, and `nuxtseo: false`, use the instructions above.
- `robots:*` and `sitemap:*` contexts use `RequestEvent`: replace `ctx.event.node.req.headers.authorization` with `ctx.event.req.headers.get('authorization')`.
- `#internal/nuxt-robots`, bare `#schema-org`, bare `#seo-utils`: use `#robots/server`, `#schema-org/app`, `#seo-utils/app`.
- On a submodule version error, run `pnpm why <package>` to find the older pin.

## Debug

- Run `npx nuxt dev`, open home. Terminal lists setup and tips; Agent and CI skip it.
- Dev `/__nuxt-seo__/setup.json` returns module/setup data. Other data: `/__site-config__/debug.json`, `/__robots__/debug.json`, `/__sitemap__/debug.json`, `/_og/debug.json`.
- DevTools needs `nuxtseo-devtools-host`, or shows an install button. `npx nuxt info` lists versions.

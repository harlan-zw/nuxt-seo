---
name: nuxtjs-seo
description: Install, configure, and debug the @nuxtjs/seo meta module, which installs robots, sitemap, OG image, Schema.org, SEO utils, link checker, site config, AI Ready, and Skew Protection. Use when a task mentions @nuxtjs/seo, Nuxt SEO, `nuxt module add seo`, disabling one SEO submodule, which config key owns an option, @nuxtjs/seo/content, an OG image renderer or `NUXT_APP_SECRET` error, upgrading from Nuxt SEO v5, or missing robots.txt and sitemap.xml after install.
license: MIT
compatibility: "Requires Node.js ^22.22.3 || ^24.15.0 || >=26.0.0. Requires Nuxt ^4.6.1 || ^5.0.0."
---

# @nuxtjs/seo

Requires Nuxt `^4.6.1 || ^5.0.0` and Node `^22.22.3 || ^24.15.0 || >=26.0.0`. The package declares Nuxt `moduleDependencies`; Nuxt installs each submodule, and setup checks versions.

In human dev sessions, the first successful home page response starts background setup checks; the report lists required fixes, optional tips, and module states. Required findings report once per Nitro server instance; agent and CI sessions skip terminal checks; production registers no runtime check. Locale prefixes and app base paths are supported.

Only required setup affects warnings and completion; DevTools shows tips separately. Tips use resolved defaults and app config, expose opt-in features, and exclude runtime inline minification and general SEO advice. Explicit opt-outs suppress the related tip; unavailable data stays unchecked until a DevTools retry.

Tips report at most once per seven days per project; state lives in the build directory, default `.nuxt/cache/nuxt-seo/setup-tips.json`; deleting it resets the cooldown. `nuxtseo: { tips: false }` disables tips in terminal and DevTools; required checks stay active. Healthy projects without eligible tips report nothing.

Every option, composable, and component comes from a submodule. Docs: nuxtseo.com/docs/nuxt-seo. This Skill covers only what the bundle adds; for one module, use its own Skill or docs (list below).

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

- Add only `@nuxtjs/seo` to `modules`; do not also list submodules, Nuxt installs each once.
- Set `site.url` and `site.name`; since v5, site config does not infer them from `package.json`.
- Set `NUXT_APP_SECRET` in production; see the `NUXT_APP_SECRET` trap.
- If the app needs OG images, install a renderer: `npx nuxt-og-image enable takumi`. See the renderer traps.

## Automatic behaviour

With only `site.url` and `site.name` set, a production build gives, for example:

- `/robots.txt` allowing all and linking the sitemap, plus `<meta name="robots">` per page (robots).
- `/sitemap.xml` with every static route (sitemap).
- Title template `%s | My Site`, canonical link, `og:url`, `og:site_name`, `og:title`/`og:description` inferred from the page (SEO utils).
- A JSON-LD graph with `WebSite` and `WebPage` (Schema.org).
- `/llms.txt` and a Markdown version of each page (AI Ready).
- Old build assets kept after a deploy, with app manifest polling (Skew Protection).
- In dev, `/robots.txt` disallows all crawlers; check indexing on a production build.
- A link check on prerender (`nuxt generate` or prerendered routes); a plain `nuxt build` does not run it.

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

- AI Ready uses its own defaults. It serves Markdown and `llms.txt`; prerendering also generates `llms-full.txt`. It publishes Agent Skills from `public/skills/<name>/SKILL.md` in the project and layers; root `skills/` stays private. With an MCP server and site URL configured, it generates an API catalog. Databases, background indexing, and cron remain opt-in. Set `aiReady.agentSkills: false` or `aiReady.apiCatalog: false` to turn those off.
- The bundle sets Skew Protection to `updateStrategy: 'polling'` and `cookie: false`. Explicit site options take precedence. Retained assets need persistent build storage: Skew Protection stores them in `node_modules/.cache/nuxt-seo/skew-protection`; preserve it in CI or configure `skewProtection.storage`. If server handlers use `isClientOutdated`, opt into `skewProtection.cookie` with a config object.
- Set `aiReady: false` or `skewProtection: false` to disable either module.

## Nuxt Content v3

Import the four schema helpers from `@nuxtjs/seo/content`. With pnpm, importing from `@nuxtjs/robots/content` fails `ERR_MODULE_NOT_FOUND`: submodules are not top level dependencies. Add `zod` 4 to the app dependencies; the helpers import it as an optional peer.

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
Breaking in v6: `asSeoCollection()` is removed. Old: `defineCollection(asSeoCollection({ ... }))`. New: the `schema` above.

## Traps

- **Production SSR returns 500 on every request without `NUXT_APP_SECRET`.** OG Image signs runtime URLs from Nuxt's `appSecret`. Dev generates a temporary secret, so local runs pass; builds never generate one. Fix: run `npx nuxt-og-image generate-secret` and set `NUXT_APP_SECRET` (32 or more characters) in production. Static output and `ogImage: { zeroRuntime: true }` need no secret.
- **A fresh install logs `No OG image renderer is installed, so OG images are off.`** With no OG Image template and no renderer, the module selects nothing and installs nothing. Fix: `npx nuxt-og-image enable takumi`, or set `ogImage: false`.
- **A template whose renderer is missing.** Interactive `nuxt dev` asks before installing. CI and Agent shells only log the `npx nypm add` command and never edit `package.json`. A production build fails if a page or route rule uses that template.
- **A submodule in the app `package.json` replaces the bundled copy.** If older than the bundle requires, the build stops with `[@nuxtjs/seo] Module @nuxtjs/sitemap version (8.6.1) does not satisfy >=9.0.1 (requested by @nuxtjs/seo).` Upgrade the pin or remove it.
- **`@nuxtjs/i18n` below v10 fails every build** with `Module @nuxtjs/i18n version (9.x) does not satisfy >=10.0 (requested by @nuxtjs/seo)`. Upgrade i18n.
- **Content `robots: 'noindex'` keeps the page in the sitemap.** Only `robots: false` removes it from `/sitemap.xml`. Both render `noindex, nofollow`.

## Version limits

- Nuxt `^4.6.1 || ^5.0.0`. An earlier Nuxt stops the build with `[@nuxtjs/seo] Nuxt 4.5.2 is not supported. @nuxtjs/seo requires Nuxt ^4.6.1 || ^5.0.0.` Fix: `npx nuxt upgrade`. Nuxt 3 apps stay on `@nuxtjs/seo` v5.
- Nuxt Content v2 is not supported; use Content v3 with Zod 4.
- v6 moved every submodule up one major and bundles AI Ready and Skew Protection. Migration: nuxtseo.com/docs/nuxt-seo/migration-guide/v5-to-v6
- Breaking in v6, each with its fix:
  - `nuxt-ai-ready` or `nuxt-skew-protection` in `modules`: remove the entry and the dependency.
  - A pinned submodule below the new major fails the build: update the pin or remove it.
  - Production 500 without `NUXT_APP_SECRET`: see Traps. Remove string `ogImage.security.secret`.
  - SEO DevTools panels show an install button: `pnpm add -D nuxtseo-devtools-host`, then restart Nuxt.
  - `robots:*` and `sitemap:*` hook contexts carry a `RequestEvent`: replace `ctx.event.node.req.headers.authorization` with `ctx.event.req.headers.get('authorization')`.
  - `#internal/nuxt-robots`, bare `#schema-org`, bare `#seo-utils`: import from `#robots/server`, `#schema-org/app`, `#seo-utils/app`.
  - `nuxtseo: false` now installs no bundled module: remove it to keep the modules.
- On a submodule version error, run `pnpm why <package>` to find the older pin.

## Debug

- Run `npx nuxt dev` and open the home page. The terminal lists required setup and tips; Agent and CI shells skip it.
- `/__nuxt-seo__/setup.json` (dev only) returns the installed and disabled modules and the setup context.
- Module data for the checks: `/__site-config__/debug.json`, `/__robots__/debug.json`, `/__sitemap__/debug.json`, `/_og/debug.json`.
- The SEO DevTools panels need `nuxtseo-devtools-host` as a dev dependency. Without it, each panel shows an install button.
- `npx nuxt info` lists the installed Nuxt and module versions.

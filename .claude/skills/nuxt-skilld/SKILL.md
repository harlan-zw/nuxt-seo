---
name: nuxt-skilld
description: "Nuxt is a free and open-source framework with an intuitive and extendable way to create type-safe, performant and production-grade full-stack web applications and websites with Vue.js. ALWAYS use when writing code importing \"nuxt\". Consult for debugging, best practices, or modifying nuxt."
metadata:
  version: 4.4.2
  generated_by: cached
  generated_at: 2026-03-23
---

# nuxt/nuxt `nuxt`

> Nuxt is a free and open-source framework with an intuitive and extendable way to create type-safe, performant and production-grade full-stack web applications and websites with Vue.js.

**Version:** 4.4.2
**Deps:** @dxup/nuxt@^0.4.0, @nuxt/cli@^3.34.0, @nuxt/devtools@^3.2.3, @nuxt/telemetry@^2.7.0, @unhead/vue@^2.1.12, @vue/shared@^3.5.30, c12@^3.3.3, chokidar@^5.0.0, compatx@^0.2.0, consola@^3.4.2, cookie-es@^2.0.0, defu@^6.1.4, devalue@^5.6.3, errx@^0.1.0, escape-string-regexp@^5.0.0, exsolve@^1.0.8, hookable@^6.0.1, ignore@^7.0.5, impound@^1.1.5, jiti@^2.6.1, klona@^2.0.6, knitwork@^1.3.0, magic-string@^0.30.21, mlly@^1.8.1, nanotar@^0.3.0, nypm@^0.6.5, ofetch@^1.5.1, ohash@^2.0.11, on-change@^6.0.2, oxc-minify@^0.117.0, oxc-parser@^0.117.0, oxc-transform@^0.117.0, oxc-walker@^0.7.0, pathe@^2.0.3, perfect-debounce@^2.1.0, picomatch@^4.0.3, pkg-types@^2.3.0, rou3@^0.8.1, scule@^1.3.0, semver@^7.7.4, std-env@^4.0.0, tinyglobby@^0.2.15, ufo@^1.6.3, ultrahtml@^1.6.0, uncrypto@^0.1.3, unctx@^2.5.0, unimport@^6.0.1, unplugin@^3.0.0, unrouting@^0.1.5, untyped@^2.0.0, vue@^3.5.30, vue-router@^5.0.3, @nuxt/nitro-server@4.4.2, @nuxt/vite-builder@4.4.2, @nuxt/kit@4.4.2, @nuxt/schema@4.4.2
**Tags:** 1x: 1.4.5, 2x: 2.18.1, alpha: 4.0.0-alpha.4, rc: 4.0.0-rc.0, latest: 4.4.2, 3x: 3.21.2

**References:** [package.json](./.skilld/pkg/package.json) — exports, entry points • [README](./.skilld/pkg/README.md) — setup, basic usage • [Docs](./.skilld/docs/_INDEX.md) — API reference, guides • [GitHub Issues](./.skilld/issues/_INDEX.md) — bugs, workarounds, edge cases • [GitHub Discussions](./.skilld/discussions/_INDEX.md) — Q&A, patterns, recipes • [Releases](./.skilld/releases/_INDEX.md) — changelog, breaking changes, new APIs

## Search

Use `skilld search` instead of grepping `.skilld/` directories — hybrid semantic + keyword search across all indexed docs, issues, and releases. If `skilld` is unavailable, use `npx -y skilld search`.

```bash
skilld search "query" -p nuxt
skilld search "issues:error handling" -p nuxt
skilld search "releases:deprecated" -p nuxt
```

Filters: `docs:`, `issues:`, `releases:` prefix narrows by source type.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes in Nuxt v4, prioritizing recent minor/major releases and breaking changes that affect runtime behavior.

### Silent Breakage (v4.0 → v4.x)

- BREAKING: `useAsyncData` — v4 no longer reruns handler when data already exists from previous render. Old code that relied on auto-rerun will silently fail to refetch. Use `refresh()` explicitly or reactive keys instead. [source](./.skilld/releases/v4.0.0.md:L197)

- BREAKING: `public/` and `assets/` aliases removed in v4. Old imports compile but resolve to undefined at runtime. Use relative paths or configure custom aliases in `nuxt.config.ts`. [source](./.skilld/releases/v4.0.0.md:L200)

- BREAKING: TypeScript context separation — v4 creates separate `tsconfig.app.json`, `tsconfig.server.json`, and `tsconfig.build.json` projects. Code that imported between contexts (e.g., server code from app context) compiles in v3 but fails in v4 type checking. Requires refactoring to respect context boundaries. [source](./.skilld/releases/v4.0.0.md:L150)

### Breaking Changes (Explicit, v4.0 → v4.x)

- BREAKING: `#app/components/layout` → `#app/components/nuxt-layout` — import path changed in v4. Old imports fail at runtime. [source](./.skilld/releases/v4.0.0.md:L218)

- BREAKING: Top-level `generate` option removed from `nuxt.config.ts`. Use route rules with `prerender` instead. [source](./.skilld/releases/v4.0.0.md:L202)

- BREAKING: `__NUXT__` global removed after hydration in v4. Code checking this property will error or behave unexpectedly. [source](./.skilld/releases/v4.0.0.md:L167)

- BREAKING: Nuxt 2 support dropped in `@nuxt/kit`. Module authors using old kit APIs will fail in v4. Kit now requires Nuxt ≥3. [source](./.skilld/releases/v4.0.0.md:L166)

### Deprecations (Still work, but flagged for v5)

- DEPRECATED: `createError({ statusCode, statusMessage })` → use `status` and `statusText` instead in v4.3+. Old properties work but are deprecated for Nitro v3/H3 v2 compatibility. [source](./.skilld/releases/v4.3.0.md:L197-204)

### New APIs (v4.1 → v4.3)

- NEW: `setPageLayout(layout, props)` — v4.3 added props parameter for dynamic layout configuration. [source](./.skilld/releases/v4.3.0.md:L116-136)

- NEW: `appLayout` in route rules — v4.3 adds centralized layout control via `routeRules: { '/admin/**': { appLayout: 'admin' } }`. [source](./.skilld/releases/v4.3.0.md:L33-46)

- NEW: `#server` alias — v4.3 provides clean imports within server directory: `import { helper } from '#server/utils/helper'`. [source](./.skilld/releases/v4.3.0.md:L138-150)

- NEW: Route groups in page meta — v4.3 exposes `route.meta.groups` for pages in folder groups like `(protected)/`. [source](./.skilld/releases/v4.3.0.md:L95-114)

- NEW: `moduleDependencies` — v4.1 allows modules to specify and configure dependencies with version constraints and setup overrides. [source](./.skilld/releases/v4.1.0.md:L138-164)

- NEW: `onInstall` and `onUpgrade` hooks — v4.1 module lifecycle hooks triggered on first install and version upgrades. [source](./.skilld/releases/v4.1.0.md:L167-187)

- NEW: `getLayerDirectories()` — v4.1 kit utility for accessing layer directories without private APIs. [source](./.skilld/releases/v4.1.0.md:L205-218)

- NEW: `useAsyncData` with `AbortController` signal — v4.2 adds signal parameter to handler for request cancellation: `useAsyncData('users', (_nuxtApp, { signal }) => $fetch(..., { signal }))`. [source](./.skilld/releases/v4.2.0.md:L15-48)

- NEW: Error overlay in dev + custom error page — v4.2 displays both technical overlay and custom error page simultaneously during development. [source](./.skilld/releases/v4.2.0.md:L50-56)

- NEW: Vite Environment API opt-in — v4.2 experimental `viteEnvironmentApi: true` flag for Vite 6 multi-environment support. [source](./.skilld/releases/v4.2.0.md:L58-89)

**Also changed:** `@nuxt/nitro-server` extracted in v4.2 · `extractAsyncDataHandlers` experimental flag in v4.2 · `typescriptPlugin` experimental support in v4.2 · `declarationPath` for components in v4.2 · `setGlobalHead()` kit utility in v4.2 · `resolveModule` with `extensions` option in v4.2 · Import maps for chunk stability in v4.1 · Rolldown bundler support in v4.1 · `defineLazyHydrationComponent` without auto-imports in v4.1 · `resolveFiles` with `ignore` option in v4.1 · `addServerImports` single import support in v4.1 · ISR/SWR payload extraction in v4.3 · Draggable error overlay in v4.3 · Async plugin constructors in v4.3 · Disable modules via `false` in options in v4.3
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Use `callOnce()` to initialize global state server-side and avoid refetching on hydration — wraps SSR and client startup logic so it runs once instead of on every navigation, ideal for CMS data and config [source](./.skilld/docs/4.api/3.utils/call-once.md:L31:48)

- Wrap `useState()` in factory composables (`const useX = () => useState('x')`) instead of declaring state at module scope — prevents cross-request state pollution on the server and memory leaks [source](./.skilld/docs/1.getting-started/11.state-management.md:L23:30)

- Pass computed refs as `useFetch()` URLs for reactive data fetching — URL changes automatically trigger refetch and share cached data across components using the same key [source](./.skilld/docs/4.api/2.composables/use-fetch.md:L69:86)

- Defer third-party library initialization to `onMounted()` hooks — prevents hydration mismatches caused by browser APIs or side effects in setup scope that don't exist server-side [source](./.skilld/docs/3.guide/2.best-practices/hydration.md:L108:130)

- Use `useRequestFetch()` for API calls on the server to automatically forward client headers and cookies — replaces the need for manual header propagation in SSR contexts [source](./.skilld/docs/1.getting-started/10.data-fetching.md:L91:100)

- Replace `localStorage` with `useCookie()` for SSR-compatible persistent storage — cookies work on both server and client, avoiding hydration mismatches [source](./.skilld/docs/3.guide/2.best-practices/hydration.md:L50:61)

- Set `parallel: true` on async plugins to load concurrently — prevents sequential plugin blocking during app initialization and improves startup performance [source](./.skilld/docs/3.guide/2.best-practices/plugins.md:L17:21)

- Use `createUseFetch()` to build custom data-fetching composables with pre-configured baseURL and headers — fully typed and avoids repeating fetch options across the app [source](./.skilld/docs/4.api/2.composables/create-use-fetch.md)

- Use `defineLazyHydrationComponent()` with `hydrate-on-visible` or `hydrate-on-interaction` for below-fold components — defers hydration until needed (viewport visibility or user action) to reduce initial time-to-interactive [source](./.skilld/docs/4.api/3.utils/define-lazy-hydration-component.md:L10:98)

- Configure hybrid rendering with `routeRules` to set caching per route — use prerender, swr (stale-while-revalidate), isr (incremental static regeneration), or `ssr: false` for fine-grained performance control without re-deploying [source](./.skilld/docs/3.guide/2.best-practices/performance.md:L44:70)
<!-- /skilld:best-practices -->

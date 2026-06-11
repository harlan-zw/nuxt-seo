---
name: devtools-layer-skilld
description: "nuxtseo-layer-devtools shared devtools layer for Nuxt SEO modules. ALWAYS use when building, modifying, or reviewing devtools client code in any Nuxt SEO module. Consult for component API, composables, implementation patterns, or debugging devtools clients."
---

# nuxtseo-layer-devtools

Shared Nuxt layer providing components, composables, and a design system for all Nuxt SEO module devtools clients.

**Source:** `packages/devtools-layer/` (published as `nuxtseo-layer-devtools`)

## Available Libraries

The layer registers these Nuxt modules, so all consumers have them available without extra config:

- **`@nuxt/ui`** (v4): Full component library. Use `UButton`, `UBadge`, `UIcon`, `UInput`, `UTooltip`, `UApp`, etc. freely. Default variants via `app.config.ts` (primary green, buttons ghost/neutral/sm, badges subtle/neutral/xs, tooltips zero delay).
- **`@vueuse/nuxt`**: All VueUse composables auto imported.
- **Shiki**: Syntax highlighting via the layer's `loadShiki` / `useRenderCodeHighlight` composables.

## Architecture (Model C — source layer, assembled)

Each module ships its devtools panel as a **source layer** under `devtools/`. It is NOT a standalone app the module builds itself.

1. **nuxtseo-shared/devtools** (`packages/shared/src/devtools.ts`): `setupDevToolsUI()` registers the Nuxt DevTools iframe tab. In dev it **assembles every installed SEO module's `devtools/` layer + the base layer into one unified client**, builds it once, and serves it at `/__nuxt-seo-devtools/<slug>` (one route per module). The module never extends the layer itself — the assembler writes the extending config.
2. **nuxtseo-layer-devtools** (`packages/devtools-layer/`): the base layer — shared components, composables, CSS, fonts.
3. **Module client** (`<module>/devtools/`): pages + lib for that module's panel. Extended by the assembler; renders at `/__nuxt-seo-devtools/<slug>`.

## Rules

1. **Module `devtools/nuxt.config.ts` is empty** — `export default defineNuxtConfig({})`. The assembler wires the layer extension. Only add `components: [{ path: resolve(__dirname, './components'), pathPrefix: false }]` if the module ships its own `components/<mod>/` UI.
2. **Use EXPLICIT imports for layer composables** — `import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'`, `import { appFetch } from '.../composables/rpc'`, `import { isProductionMode, path, refreshTime } from '.../composables/state'`, `import { loadShiki } from '.../composables/shiki'`. Do NOT rely on auto-imports / `#imports` for layer composables (`#imports` is fine for Nuxt built-ins like `navigateTo`, `useRoute`, `useAsyncData`).
3. **The consuming module's root `tsconfig.json` MUST exclude both `dist` and `devtools`.** The devtools client is a separate layer-extended app, typechecked only when assembled — never at the module root. Omitting `dist` lets the `client:build` copy get typechecked in the wrong context (no layer auto-imports, drags the layer's raw `.ts` in) and breaks `nuxt typecheck`.
4. ALWAYS use layer components over custom HTML: `DevtoolsSection` not custom details, `DevtoolsKeyValue` not custom tables, `DevtoolsSnippet`/`OCodeBlock` not custom code blocks, `DevtoolsPanel` not a custom card, `DevtoolsEmptyState`/`DevtoolsLoading`/`DevtoolsAlert` not custom equivalents. Use `KeyValueItem.code` for inline code instead of separate snippets.
5. ALWAYS use `@nuxt/ui` components (`UButton`, `UInput`, `UBadge`, `UIcon`, `UTooltip`, etc.) for interactive elements. Never hand-roll a button/input/badge/tooltip.
6. NEVER add custom CSS that duplicates what the layer or Nuxt UI provides.
7. NEVER enable SSR in the client (it runs in an iframe) — the layer already sets `ssr: false`.
8. ALWAYS disable the module itself in the assembled client (the base layer sets `robots: false`, `sitemap: false`, `content: false`).
9. ALWAYS guard devtools setup with `if (nuxt.options.dev)` in `module.ts`; debug server routes are dev-only.
10. Debug endpoint convention: `/__<module>__/debug.json` (og-image is the historical exception: `/_og/debug.json`).
11. Use Carbon icons consistently (`carbon:` prefix). Give the debug tab `devOnly: true`; redirect dev-only tabs to the index in production via an `isProductionMode` watch.

## Required File Structure

```
devtools/
├── nuxt.config.ts              # empty defineNuxtConfig({}) (+ components reg only if components/ exists)
├── pages/
│   ├── <mod>.vue               # DevtoolsLayout shell + <NuxtPage/> (REQUIRED)
│   └── <mod>/
│       ├── index.vue           # overview tab
│       ├── debug.vue           # devOnly tab
│       ├── docs.vue            # <DevtoolsDocs url=.../>
│       └── <other-tabs>.vue
├── lib/<mod>/
│   ├── state.ts                # data ref + refreshSources() + watch (REQUIRED)
│   └── rpc.ts                  # useDevtoolsConnection() (REQUIRED)
└── components/<mod>/           # OPTIONAL: module-specific UI only
src/
├── devtools.ts                 # wraps setupDevToolsUI from nuxtseo-shared/devtools
├── module.ts                   # setupDevToolsUI(dev only) + registers debug route
└── runtime/server/routes/__<module>__/
    └── debug.json.ts           # JSON debug endpoint
```

## Implementation Templates

For full component/composable API reference, read [reference.md](./reference.md).

### devtools/nuxt.config.ts

```ts
// Assembled by nuxtseo-shared in the user's project; this extends the base layer there.
export default defineNuxtConfig({})
```

### devtools/lib/<mod>/rpc.ts

```ts
import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'

// The layer's connection plugin already wires appFetch + route tracking and refreshes
// on connect; state.ts watches refreshTime to reload data, so no module host access here.
useDevtoolsConnection()
```

### devtools/lib/<mod>/state.ts

```ts
import type { DebugData } from './types'
import { appFetch } from 'nuxtseo-layer-devtools/composables/rpc'
import { path, productionUrl, refreshTime } from 'nuxtseo-layer-devtools/composables/state'
import { ref, watch } from 'vue'

export const data = ref<DebugData | null>(null)

export async function refreshSources() {
  if (!appFetch.value)
    return
  data.value = await appFetch.value('/__<mod>__/debug.json', { query: { path: path.value } }).catch(() => null)
  if (data.value?.siteConfig?.url)
    productionUrl.value = data.value.siteConfig.url
}

watch([path, appFetch, refreshTime], () => {
  refreshSources()
})
```

### devtools/pages/<mod>.vue (shell)

```vue
<script setup lang="ts">
import { isProductionMode } from 'nuxtseo-layer-devtools/composables/state'
import { computed, watch } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { data, refreshSources } from '../lib/<mod>/state'
import '../lib/<mod>/rpc'

const route = useRoute()
const currentTab = computed(() => {
  const p = route.path
  if (p.startsWith('/<mod>/debug'))
    return 'debug'
  if (p.startsWith('/<mod>/docs'))
    return 'docs'
  return 'overview'
})
const navItems = [
  { value: 'overview', to: '/<mod>', icon: 'carbon:dashboard', label: 'Overview', devOnly: false },
  { value: 'debug', to: '/<mod>/debug', icon: 'carbon:debug', label: 'Debug', devOnly: true },
  { value: 'docs', to: '/<mod>/docs', icon: 'carbon:book', label: 'Docs', devOnly: false },
]
const version = computed(() => data.value?.runtimeConfig?.version || '')

watch(isProductionMode, (isProd) => {
  if (isProd && currentTab.value === 'debug')
    return navigateTo('/<mod>')
})
</script>

<template>
  <DevtoolsLayout
    v-model:active-tab="currentTab"
    module-name="nuxt-<module>"
    title="Title"
    icon="carbon:icon"
    :version="version"
    :nav-items="navItems"
    github-url="https://github.com/..."
    :loading="!data"
    @refresh="refreshSources"
  >
    <NuxtPage />
  </DevtoolsLayout>
</template>
```

`DevtoolsLayout` derives the npm package + update-check and renders `DevtoolsTroubleshooting` in the debug tab automatically from `module-name` — do not pass an `npmPackage` prop or hand-roll troubleshooting.

### src/module.ts (dev only)

```ts
if (nuxt.options.dev) {
  addServerHandler({ route: '/__<module>__/debug.json', handler: resolve('./runtime/server/routes/__<module>__/debug.json') })
  setupDevToolsUI(config, resolve)
}
```

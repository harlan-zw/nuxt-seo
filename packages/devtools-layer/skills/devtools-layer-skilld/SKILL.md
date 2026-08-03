---
name: devtools-layer-skilld
description: "nuxtseo-layer-devtools shared devtools layer for Nuxt SEO modules. ALWAYS use when building, modifying, or reviewing devtools client code in any Nuxt SEO module. Consult for component API, composables, implementation patterns, or debugging devtools clients."
---

# nuxtseo-layer-devtools

Shared components, composables, and design system for Nuxt SEO module devtools clients. Source: `packages/devtools-layer/`; package: `nuxtseo-layer-devtools`.

## Available Libraries

Consumers get these without extra config:

- **`@nuxt/ui`** v4: `UButton`, `UBadge`, `UIcon`, `UInput`, `UTooltip`, `UApp`, and default variants from `app.config.ts`.
- **`@vueuse/nuxt`**: All VueUse composables auto imported.
- **Shiki**: `loadShiki` and `useRenderCodeHighlight`.

## Architecture (Model C — source layer, assembled)

Each module ships a source layer under `devtools/`:

1. `nuxtseo-shared/devtools` discovers module layers, assembles one client, then serves each module at `/__nuxt-seo-devtools/<slug>`.
2. `nuxtseo-layer-devtools` supplies shared UI, composables, CSS, and fonts.
3. `<module>/devtools/` supplies that module's pages and state. The assembler extends it with the base layer.

## Rules

1. Module `devtools/nuxt.config.ts` contains `export default defineNuxtConfig({})`. Only register components when the module ships `components/<mod>/`.
2. **Use EXPLICIT imports for layer composables** — `import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'`, `import { appFetch } from '.../composables/rpc'`, `import { isProductionMode, path, refreshTime } from '.../composables/state'`, `import { loadShiki } from '.../composables/shiki'`. Do NOT rely on auto-imports / `#imports` for layer composables (`#imports` is fine for Nuxt built-ins like `navigateTo`, `useRoute`, `useAsyncData`).
3. The module root `tsconfig.json` MUST exclude `dist` and `devtools`. Typecheck the devtools client only when assembled.
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
  data.value = await appFetch.value('/__<mod>__/debug.json', { query: { path: path.value } }).catch((error) => {
    console.warn('[nuxt-seo] failed to refresh debug data:', error)
    return null
  })
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

`DevtoolsLayout` derives package updates and debug troubleshooting from `module-name`. Do not pass `npmPackage` or recreate troubleshooting.

### src/module.ts (dev only)

```ts
if (nuxt.options.dev) {
  addServerHandler({ route: '/__<module>__/debug.json', handler: resolve('./runtime/server/routes/__<module>__/debug.json') })
  setupDevToolsUI(config, resolve)
}
```

## Example:

For `nuxt-sitemap`, replace `<mod>` with `sitemap`; use `/sitemap` for the shell and `/__sitemap__/debug.json` for debug data.

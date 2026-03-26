---
name: devtools-layer-skilld
description: "nuxtseo-layer-devtools shared devtools layer for Nuxt SEO modules. ALWAYS use when building, modifying, or reviewing devtools client code in any Nuxt SEO module. Consult for component API, composables, implementation patterns, or debugging devtools clients."
---

# nuxtseo-layer-devtools

Shared Nuxt layer providing components, composables, and a design system for all Nuxt SEO module devtools clients.

**Source:** `packages/devtools-layer/` (published as `nuxtseo-layer-devtools`)

## Available Libraries

The layer registers these Nuxt modules, so all consumers have them available without extra config:

- **`@nuxt/ui`** (v4): Full component library. Use `UButton`, `UBadge`, `UIcon`, `UInput`, `UTooltip`, `UApp`, etc. freely in devtools clients. Default variants configured via `app.config.ts` (primary: green, buttons: ghost/neutral/sm, badges: subtle/neutral/xs, tooltips: zero delay).
- **`@vueuse/nuxt`**: All VueUse composables auto imported.
- **Shiki**: Syntax highlighting via the layer's `loadShiki` / `useRenderCodeHighlight` composables.

## Architecture

1. **nuxtseo-shared/devtools** (`packages/shared/src/devtools.ts`): `setupDevToolsUI()` registers iframe tab, handles dev proxy + production sirv
2. **nuxtseo-layer-devtools** (`packages/devtools-layer/`): Nuxt layer with shared UI, composables, CSS
3. **Module client** (`<module>/client/`): Extends the layer, adds module specific UI and debug routes

## Rules

1. ALWAYS extend `nuxtseo-layer-devtools` in client/nuxt.config.ts
2. ALWAYS create `client/composables/rpc.ts` that calls `useDevtoolsConnection()`
3. ALWAYS use layer components over custom HTML: `DevtoolsSection` not custom details, `DevtoolsKeyValue` not custom tables, `DevtoolsSnippet` not custom code blocks. Use `KeyValueItem.code` for inline code rendering instead of separate snippets
4. ALWAYS use `@nuxt/ui` components (`UButton`, `UInput`, `UBadge`, `UIcon`, `UTooltip`, etc.) for interactive elements. Never add a custom button, input, badge, or tooltip when a Nuxt UI component exists.
5. NEVER add custom CSS that duplicates what the layer or Nuxt UI provides
6. NEVER enable SSR in the client (it runs in an iframe)
7. ALWAYS disable the module itself in the client nuxt config (e.g. `robots: false`)
8. ALWAYS guard devtools setup with `if (nuxt.options.dev)` in module.ts
9. ALWAYS use `useAsyncData` with `watch: [refreshTime]` for reactive data fetching
10. Use Carbon icons consistently (prefix: `carbon:`)
11. Debug server routes ONLY registered in dev mode

## Required File Structure

```
client/
├── nuxt.config.ts          # extends nuxtseo-layer-devtools
├── app.vue                 # OR pages/ directory
├── composables/
│   └── rpc.ts              # connection setup (REQUIRED)
src/
├── devtools.ts             # calls setupDevToolsUI from nuxtseo-shared/devtools
├── module.ts               # calls setupDevToolsUI in dev, registers debug routes
└── runtime/server/routes/__<module>__/
    └── debug.ts            # JSON debug endpoint
```

## Implementation Templates

For full component/composable API reference, read [reference.md](./reference.md).

### client/nuxt.config.ts

```ts
export default defineNuxtConfig({
  extends: ['nuxtseo-layer-devtools'],
  // <moduleName>: false,
  app: { baseURL: '/__<module-route>' },
  nitro: { output: { publicDir: resolve('./dist/client') } },
})
```

### client/composables/rpc.ts

```ts
useDevtoolsConnection({
  onConnected() { refreshSources() },
  onRouteChange() { refreshSources() },
})
```

### src/devtools.ts

```ts
import { setupDevToolsUI as _setup } from 'nuxtseo-shared/devtools'

export function setupDevToolsUI(config: any, resolve: Resolver['resolve'], nuxt?: Nuxt) {
  return _setup({ route: '/__<route>', name: '<name>', title: '<Title>', icon: 'carbon:<icon>' }, resolve, nuxt)
}
```

### src/module.ts

```ts
if (nuxt.options.dev) {
  addServerHandler({ route: '/__<module>__/debug', handler: resolve('./runtime/server/routes/__<module>__/debug') })
  setupDevToolsUI(config, resolve)
}
```

### app.vue pattern

```vue
<script setup lang="ts">
const activeTab = ref('overview')
const loading = ref(true)
const { data } = await useAsyncData('debug', () => $fetch('/__<module>__/debug.json'), { watch: [refreshTime] })
watch(data, () => {
  loading.value = false
})
</script>

<template>
  <DevtoolsLayout v-model:active-tab="activeTab" title="Name" icon="carbon:icon" module-name="nuxt-<module>" :nav-items="navItems" github-url="..." :loading @refresh="refreshSources">
    <DevtoolsLoading v-if="loading" />
    <template v-else-if="activeTab === 'overview'">
      <!-- content -->
    </template>
  </DevtoolsLayout>
</template>
```

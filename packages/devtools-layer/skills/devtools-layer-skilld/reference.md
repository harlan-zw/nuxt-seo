# Devtools Layer API Reference

## Components (auto imported)

### Layout & Structure

| Component | Props | Key Slots | Purpose |
|---|---|---|---|
| `DevtoolsLayout` | `title`, `icon`, `version?`, `navItems`, `githubUrl`, `loading?` | `actions`, default | Main shell with header, tabs, refresh |
| `DevtoolsPanel` | `title?` | `header`, `actions`, default | Card container with close button |
| `DevtoolsToolbar` | `variant` ('default'\|'minimal') | default | Horizontal toolbar strip |
| `DevtoolsSection` | `icon?`, `text?`, `description?`, `collapse?`, `open?`, `padding?` | `text`, `description`, `actions`, `details`, default, `footer` | Collapsible details/summary block |

### Feedback & States

| Component | Props | Key Slots | Purpose |
|---|---|---|---|
| `DevtoolsAlert` | `icon?`, `variant` ('info'\|'warning'\|'error'\|'success'\|'production') | default, `action` | Color coded status bar |
| `DevtoolsError` | `icon?`, `title?`, `error?` | default | Centered error display |
| `DevtoolsEmptyState` | `icon?`, `title`, `description?`, `variant` ('default'\|'error') | default, `description` | No results placeholder |
| `DevtoolsProductionError` | `error?` | none | Production URL unreachable |
| `DevtoolsLoading` | none | none | Centered spinner |

### Data Display

| Component | Props | Key Slots | Purpose |
|---|---|---|---|
| `DevtoolsKeyValue` | `items: KeyValueItem[]`, `striped?` | none | Key value table with copy, links, booleans, inline code |
| `DevtoolsMetric` | `label?`, `value`, `icon?`, `variant` | none | Small inline metric badge |
| `DevtoolsCopyButton` | `text` | none | Copy to clipboard button |
| `DevtoolsSnippet` | `label?`, `code`, `lang` ('js'\|'json'\|'xml') | `header` | Code block with header, copy, max 300px scroll |
| `OCodeBlock` | `code`, `lang`, `lines?`, `transformRendered?` | none | Shiki syntax highlighted pre |
| `DevtoolsDocs` | `url` | none | Full height iframe |

### KeyValueItem Interface

```ts
interface KeyValueItem {
  key: string
  value: any
  copyable?: boolean
  mono?: boolean
  link?: string
  /** Render value using DevtoolsSnippet. Pass the language for syntax highlighting. */
  code?: 'js' | 'json' | 'xml'
}
```

## Composables (auto imported)

### Connection (`composables/rpc.ts`)

```ts
const appFetch: Ref<$Fetch | undefined> // Host app's $fetch
const devtools: Ref<NuxtDevtoolsClient> // Devtools client instance
const colorMode: Ref<'dark' | 'light'> // Synced from host

function useDevtoolsConnection(options?: {
  onConnected?: (client: any) => void
  onRouteChange?: (route: any) => void
}): void
```

### State (`composables/state.ts`)

```ts
const refreshTime: Ref<number> // Watch to trigger re-fetch
const hostname: string
const path: Ref<string>
const query: Ref<any>
const base: Ref<string>
const host: ComputedRef<string>
const refreshSources: () => void // Debounced 200ms
const slowRefreshSources: () => void // Debounced 1000ms

// Production preview mode
const previewSource: Ref<'local' | 'production'> // localStorage persisted
const productionUrl: Ref<string>
const hasProductionUrl: ComputedRef<boolean>
const isProductionMode: ComputedRef<boolean>
```

### Shiki (`composables/shiki.ts`)

```ts
async function loadShiki(options?: { extraLangs?: LanguageRegistration[] }): Promise<HighlighterCore>
function useRenderCodeHighlight(code: MaybeRef<string>, lang: string): ComputedRef<string>
```

### Clipboard (`composables/clipboard.ts`)

```ts
function useCopy(timeout?: number): { copy: (text: string) => Promise<void>, copied: Ref<boolean> }
```

## CSS Design System

Do NOT add custom CSS unless layer components are insufficient.

### Semantic Variables

`--color-surface`, `--color-surface-elevated`, `--color-surface-sunken`, `--color-border`, `--color-border-subtle`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--seo-green`, `--radius-sm/md/lg`

### Utility Classes

`.glass` (backdrop blur), `.gradient-bg` (green/blue radials), `.card` (elevated hover), `.code-block`, `.status-enabled/.status-disabled`, `.link-external` (with arrow), `.hint-callout`, `.panel-grids`, `.animate-fade-up/.scale-in/.spin`, `.stagger-children`, `.devtools-main-content` (max-width 80rem centered container)

### Nuxt UI Defaults (app.config.ts)

Primary: green, Neutral: neutral. Buttons: ghost/neutral/sm. Badges: subtle/neutral/xs. Tooltips: zero delay.

## Common Patterns

### Production Mode Data Fetching

```ts
async function refreshSources() {
  if (isProductionMode.value)
    data.value = await $fetch(`/__<module>__/debug-production.json`, { query: { url: productionUrl.value } })
  else
    data.value = await $fetch('/__<module>__/debug.json', { query: { path: path.value } })
}
watch(isProductionMode, refreshSources)
```

### Custom Shiki Language

```ts
import { loadShiki as _loadShiki } from '#imports'

const customLang: LanguageRegistration = { name: 'my-lang', scopeName: 'source.my-lang', patterns: [] }
export function loadShiki() {
  return _loadShiki({ extraLangs: [customLang] })
}
```

### Fallback Connection

```ts
const connectionState = ref<'connecting' | 'connected' | 'fallback' | 'failed'>('connecting')
useDevtoolsConnection({
  onConnected() {
    connectionState.value = 'connected'
    refreshSources()
  },
  onRouteChange(route) {
    path.value = route.path
    refreshSources()
  },
})
onMounted(() => {
  const timer = setTimeout(() => {
    if (connectionState.value === 'connecting') {
      connectionState.value = 'fallback'
      appFetch.value = $fetch.create({ baseURL: 'http://localhost:3000' })
      refreshSources()
    }
  }, 2000)

  onUnmounted(() => {
    clearTimeout(timer)
  })
})
```

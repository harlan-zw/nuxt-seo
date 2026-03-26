<script setup lang="ts">
import { computed } from 'vue'
import { moduleCatalog } from '../composables/modules'

const { moduleName } = defineProps<{
  moduleName: string
}>()

const keyLabels: Record<string, string> = {
  'basic': 'Basic',
  'i18n': 'Nuxt I18n',
  'content': 'Nuxt Content',
  'basic-satori': 'Basic (Satori)',
  'basic-takumi': 'Basic (Takumi)',
  'dynamic-urls': 'Dynamic URLs',
  'custom-rules': 'Custom Rules',
  'broken-links': 'Broken Links',
  'skip-inspection': 'Skip Inspection',
  'breadcrumbs': 'Breadcrumbs',
  'meta-tags': 'Meta Tags',
  'blog': 'Blog',
  'e-commerce': 'E-Commerce',
  'env-driven': 'Env Driven',
  'multi-site': 'Multi Site',
}

const CAMEL_RE = /([a-z])([A-Z])/g
const SEP_RE = /[-_]/g
const WORD_RE = /\b\w/g

function humanizeKey(key: string) {
  if (keyLabels[key])
    return keyLabels[key]
  return key
    .replace(CAMEL_RE, '$1 $2')
    .replace(SEP_RE, ' ')
    .replace(WORD_RE, c => c.toUpperCase())
}

const playgrounds = computed(() => {
  const mod = moduleCatalog.value.find(m => m.name === moduleName)
  if (!mod?.playgrounds)
    return []
  return Object.entries(mod.playgrounds).map(([key, url]) => ({
    key,
    label: humanizeKey(key),
    url,
  }))
})
</script>

<template>
  <div v-if="playgrounds.length" class="playgrounds-list">
    <a
      v-for="pg in playgrounds"
      :key="pg.key"
      :href="pg.url"
      target="_blank"
      rel="noopener"
      class="playground-btn"
    >
      <UIcon name="carbon:launch" class="w-3 h-3 shrink-0 opacity-50" />
      <span>{{ pg.label }}</span>
    </a>
  </div>
</template>

<style scoped>
.playgrounds-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.playground-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-border);
  text-decoration: none;
  transition: background 100ms, color 100ms, border-color 100ms;
}

.playground-btn:hover {
  background: var(--color-surface-sunken);
  color: var(--color-text);
  border-color: var(--color-neutral-400);
}

.dark .playground-btn:hover {
  border-color: var(--color-neutral-600);
}
</style>

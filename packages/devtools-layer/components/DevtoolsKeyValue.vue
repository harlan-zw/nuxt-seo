<script setup lang="ts">
export interface KeyValueItem {
  key: string
  value: string | number | boolean | undefined
  copyable?: boolean
  mono?: boolean
  link?: string
}

const { items, striped = false } = defineProps<{
  items: KeyValueItem[]
  striped?: boolean
}>()
</script>

<template>
  <div class="divide-y divide-[var(--color-border-subtle)]">
    <div
      v-for="item in items"
      :key="item.key"
      class="devtools-kv-row group"
      :class="{ 'devtools-kv-striped': striped }"
    >
      <span class="devtools-kv-key">{{ item.key }}</span>
      <div class="devtools-kv-value-wrap">
        <a
          v-if="item.link"
          :href="item.link"
          target="_blank"
          rel="noopener"
          class="link-external text-sm"
        >
          {{ item.value }}
        </a>
        <span
          v-else
          class="devtools-kv-value"
          :class="{
            'font-mono': item.mono !== false,
            'devtools-kv-true': item.value === true,
            'devtools-kv-false': item.value === false,
            'devtools-kv-empty': item.value === undefined || item.value === '',
          }"
        >
          {{ item.value === undefined || item.value === '' ? '(empty)' : item.value }}
        </span>
        <DevtoolsCopyButton
          v-if="item.copyable && item.value !== undefined && item.value !== ''"
          :text="String(item.value)"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.devtools-kv-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 1.25rem;
  transition: background-color 150ms ease;
}

.devtools-kv-row:hover {
  background: var(--color-surface-sunken);
}

.devtools-kv-striped:nth-child(even) {
  background: oklch(from var(--color-surface-sunken) l c h / 0.5);
}

.devtools-kv-key {
  font-size: 0.8125rem;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.devtools-kv-value-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.devtools-kv-value {
  font-size: 0.8125rem;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.devtools-kv-true {
  color: var(--seo-green);
}

.devtools-kv-false {
  color: oklch(65% 0.15 25);
}

.devtools-kv-empty {
  color: var(--color-text-subtle);
  font-style: italic;
}
</style>

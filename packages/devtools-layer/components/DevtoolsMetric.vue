<script setup lang="ts">
const {
  label,
  value,
  icon,
  variant = 'default',
} = defineProps<{
  label?: string
  value: string | number
  icon?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}>()
</script>

<template>
  <div class="devtools-metric" :class="`devtools-metric-${variant}`">
    <UIcon v-if="icon" :name="icon" class="devtools-metric-icon" aria-hidden="true" />
    <span class="devtools-metric-value">{{ value }}</span>
    <span v-if="label" class="devtools-metric-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.devtools-metric {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  font-variant-numeric: tabular-nums;
}

.devtools-metric-icon {
  font-size: 0.875rem;
  flex-shrink: 0;
}

.devtools-metric-value {
  font-family: var(--font-mono);
  font-weight: 600;
}

.devtools-metric-label {
  color: inherit;
  opacity: 0.7;
}

/* Variants */
.devtools-metric-default {
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text);
}

.devtools-metric-success {
  background: oklch(75% 0.15 145 / 0.12);
  color: oklch(50% 0.15 145);
}

.dark .devtools-metric-success {
  background: oklch(50% 0.15 145 / 0.15);
  color: oklch(75% 0.18 145);
}

.devtools-metric-warning {
  background: oklch(80% 0.12 85 / 0.12);
  color: oklch(55% 0.15 85);
}

.dark .devtools-metric-warning {
  background: oklch(55% 0.12 85 / 0.15);
  color: oklch(75% 0.15 85);
}

.devtools-metric-danger {
  background: oklch(65% 0.12 25 / 0.1);
  color: oklch(55% 0.15 25);
}

.dark .devtools-metric-danger {
  background: oklch(45% 0.1 25 / 0.15);
  color: oklch(70% 0.12 25);
}

.devtools-metric-info {
  background: oklch(85% 0.08 200 / 0.1);
  color: oklch(50% 0.12 200);
}

.dark .devtools-metric-info {
  background: oklch(35% 0.08 200 / 0.15);
  color: oklch(70% 0.1 200);
}
</style>

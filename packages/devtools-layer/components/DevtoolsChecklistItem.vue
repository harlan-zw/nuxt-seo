<script setup lang="ts">
import type { ChecklistItemResult } from '../composables/checklist'

const { item } = defineProps<{
  item: ChecklistItemResult
}>()
</script>

<template>
  <div class="checklist-item" :class="item.passed ? 'is-passed' : `is-pending-${item.level}`">
    <div class="checklist-item-status">
      <UIcon
        :name="item.passed ? 'carbon:checkmark-filled' : item.level === 'required' ? 'carbon:warning-alt-filled' : 'carbon:circle-dash'"
        class="checklist-item-icon"
      />
    </div>
    <div class="checklist-item-content">
      <div class="checklist-item-header">
        <span class="checklist-item-label">{{ item.label }}</span>
        <UBadge
          v-if="!item.passed"
          size="xs"
          :color="item.level === 'required' ? 'error' : 'warning'"
          variant="subtle"
          class="checklist-item-level"
        >
          {{ item.level === 'required' ? 'Required' : 'Tip' }}
        </UBadge>
      </div>
      <div class="checklist-item-description">
        {{ item.description }}
      </div>
      <div v-if="item.detail" class="checklist-item-detail">
        {{ item.detail }}
      </div>
    </div>
    <a
      :href="item.docsUrl"
      target="_blank"
      rel="noopener"
      class="checklist-item-docs"
      :class="item.passed ? 'is-subtle' : ''"
    >
      <UIcon name="carbon:arrow-up-right" class="w-3 h-3" />
    </a>
  </div>
</template>

<style scoped>
.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.4375rem 0.5rem;
  border-radius: var(--radius-md);
  transition: background 100ms;
}

.checklist-item:hover {
  background: var(--color-surface-elevated);
}

.checklist-item.is-passed {
  opacity: 0.55;
}

.checklist-item.is-passed:hover {
  opacity: 0.8;
}

.checklist-item-status {
  flex-shrink: 0;
  padding-top: 0.125rem;
}

.checklist-item-icon {
  font-size: 0.8125rem;
}

.checklist-item.is-passed .checklist-item-icon {
  color: oklch(50% 0.15 145);
}

.dark .checklist-item.is-passed .checklist-item-icon {
  color: oklch(70% 0.18 145);
}

.checklist-item.is-pending-required .checklist-item-icon {
  color: oklch(55% 0.2 25);
}

.dark .checklist-item.is-pending-required .checklist-item-icon {
  color: oklch(70% 0.16 25);
}

.checklist-item.is-pending-recommended .checklist-item-icon {
  color: oklch(52% 0.15 85);
}

.dark .checklist-item.is-pending-recommended .checklist-item-icon {
  color: oklch(72% 0.12 85);
}

.checklist-item-content {
  flex: 1;
  min-width: 0;
}

.checklist-item-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.checklist-item-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text);
}

.checklist-item-level {
  font-size: 0.5rem !important;
  padding: 0 0.25rem !important;
  line-height: 1.4 !important;
}

.checklist-item-description {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  margin-top: 0.0625rem;
  line-height: 1.35;
}

.checklist-item-detail {
  display: inline-block;
  font-size: 0.5625rem;
  font-family: var(--font-mono, monospace);
  color: var(--color-text-subtle);
  margin-top: 0.1875rem;
  padding: 0.0625rem 0.3125rem;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-sm);
}

.checklist-item-docs {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.0625rem;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 100ms, background 100ms;
}

.checklist-item-docs:hover {
  color: var(--seo-green);
  background: oklch(from var(--seo-green) l c h / 0.08);
}

.checklist-item-docs.is-subtle {
  opacity: 0;
}

.checklist-item:hover .checklist-item-docs.is-subtle {
  opacity: 1;
}
</style>

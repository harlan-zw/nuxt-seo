<script setup lang="ts">
const {
  title,
} = defineProps<{
  title?: string
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <div class="devtools-panel">
    <div v-if="title || $slots.header" class="devtools-panel-header">
      <slot name="header">
        <span class="devtools-panel-title">{{ title }}</span>
      </slot>
      <div class="devtools-panel-actions">
        <slot name="actions" />
        <UButton
          icon="carbon:close"
          aria-label="Close panel"
          @click="$emit('close')"
        />
      </div>
    </div>
    <div class="devtools-panel-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.devtools-panel {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-elevated);
  box-shadow: 0 8px 32px oklch(0% 0 0 / 0.12);
  overflow: hidden;
}

.dark .devtools-panel {
  box-shadow: 0 8px 32px oklch(0% 0 0 / 0.4);
}

.devtools-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
}

.devtools-panel-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
}

.devtools-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.devtools-panel-content {
  flex: 1;
  overflow: auto;
}
</style>

<script setup lang="ts">
const {
  variant = 'default',
} = defineProps<{
  variant?: 'default' | 'minimal'
}>()
</script>

<template>
  <div class="devtools-toolbar" :class="`devtools-toolbar-${variant}`" role="toolbar">
    <slot />
  </div>
</template>

<style scoped>
.devtools-toolbar {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
}

.devtools-toolbar-default {
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: var(--color-surface-elevated);
  position: relative;
}

@media (min-width: 640px) {
  .devtools-toolbar-default {
    padding: 0.75rem 1rem;
  }
}

.devtools-toolbar-minimal {
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  background: var(--color-surface-sunken);
}
</style>

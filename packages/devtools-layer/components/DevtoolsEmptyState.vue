<script setup lang="ts">
const {
  icon = 'carbon:search',
  title,
  description,
  variant = 'default',
} = defineProps<{
  icon?: string
  title: string
  description?: string
  variant?: 'default' | 'error'
}>()
</script>

<template>
  <div class="devtools-empty">
    <div class="devtools-empty-icon" :class="`devtools-empty-icon-${variant}`">
      <UIcon :name="icon" class="w-8 h-8" aria-hidden="true" />
    </div>
    <h2 class="devtools-empty-title">
      {{ title }}
    </h2>
    <p v-if="description || $slots.description" class="devtools-empty-description">
      <slot name="description">
        {{ description }}
      </slot>
    </p>
    <div v-if="$slots.default" class="devtools-empty-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.devtools-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 32rem;
  margin: 0 auto;
}

.devtools-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
}

.devtools-empty-icon-default {
  background: oklch(65% 0.2 145 / 0.12);
  color: var(--seo-green);
}

.dark .devtools-empty-icon-default {
  background: oklch(65% 0.2 145 / 0.15);
}

.devtools-empty-icon-error {
  background: oklch(55% 0.2 25 / 0.12);
  color: oklch(55% 0.2 25);
}

.dark .devtools-empty-icon-error {
  background: oklch(55% 0.2 25 / 0.15);
  color: oklch(75% 0.15 25);
}

.devtools-empty-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.75rem;
}

@media (min-width: 640px) {
  .devtools-empty-title {
    font-size: 1.25rem;
  }
}

.devtools-empty-description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

@media (min-width: 640px) {
  .devtools-empty-description {
    font-size: 1rem;
  }
}

.devtools-empty-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
</style>

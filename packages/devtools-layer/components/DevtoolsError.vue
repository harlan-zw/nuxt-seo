<script setup lang="ts">
const { icon = 'carbon:warning', title = 'Something went wrong' } = defineProps<{
  icon?: string
  title?: string
  error?: string | Error | null
}>()
</script>

<template>
  <div class="devtools-error">
    <div class="devtools-error-icon-wrap">
      <UIcon :name="icon" class="devtools-error-icon" />
    </div>
    <p class="devtools-error-title">
      {{ title }}
    </p>
    <p v-if="error" class="devtools-error-message">
      {{ typeof error === 'string' ? error : error.message }}
    </p>
    <div v-if="$slots.default" class="devtools-error-actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.devtools-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.devtools-error-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-lg);
  background: oklch(65% 0.15 25 / 0.1);
}

.dark .devtools-error-icon-wrap {
  background: oklch(45% 0.1 25 / 0.15);
}

.devtools-error-icon {
  font-size: 1.5rem;
  color: oklch(60% 0.18 25);
}

.dark .devtools-error-icon {
  color: oklch(70% 0.15 25);
}

.devtools-error-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.devtools-error-message {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  max-width: 20rem;
  line-height: 1.5;
}

.devtools-error-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}
</style>

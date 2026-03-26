<script setup lang="ts">
import type { NuxtError } from '#app'

const { error } = defineProps<{
  error: NuxtError
}>()

// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001B\[[0-9;]*m/g

const stack = computed(() => {
  if (!error.stack)
    return ''
  // Clean ANSI codes if present
  return error.stack.replace(ANSI_RE, '')
})

function handleClear() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="error-page">
    <div class="error-container">
      <div class="error-icon-wrap">
        <UIcon name="carbon:warning" class="error-icon" />
      </div>
      <h1 class="error-title">
        {{ error.statusCode || 'Error' }}: {{ error.message || 'Something went wrong' }}
      </h1>
      <pre v-if="stack" class="error-stack">{{ stack }}</pre>
      <div class="error-actions">
        <UButton size="sm" @click="handleClear">
          Clear Error
        </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1.5rem;
  background: var(--color-surface, #fff);
  color: var(--color-text, #1a1a1a);
  font-family: var(--font-sans, system-ui, sans-serif);
}

@media (prefers-color-scheme: dark) {
  .error-page {
    background: #111;
    color: #e5e5e5;
  }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  max-width: 48rem;
  width: 100%;
  text-align: center;
}

.error-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: oklch(65% 0.15 25 / 0.1);
}

.error-icon {
  font-size: 1.5rem;
  color: oklch(60% 0.18 25);
}

.error-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.error-stack {
  width: 100%;
  max-height: 60vh;
  overflow: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  background: oklch(0% 0 0 / 0.05);
  border: 1px solid oklch(0% 0 0 / 0.1);
  font-family: var(--font-mono, ui-monospace, monospace);
  font-size: 0.6875rem;
  line-height: 1.6;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (prefers-color-scheme: dark) {
  .error-stack {
    background: oklch(100% 0 0 / 0.05);
    border-color: oklch(100% 0 0 / 0.1);
  }
}

.error-actions {
  margin-top: 0.5rem;
}
</style>

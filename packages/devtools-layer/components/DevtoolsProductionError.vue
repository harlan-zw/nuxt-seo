<script setup lang="ts">
import { previewSource, productionUrl } from '../composables/state'

const { error } = defineProps<{
  error?: string | Error | null
}>()
</script>

<template>
  <DevtoolsError
    icon="carbon:cloud-offline"
    title="Production site unreachable"
    :error="error"
  >
    <template v-if="!error">
      <p class="text-xs text-[var(--color-text-muted)] max-w-xs leading-relaxed">
        Could not connect to <code class="prod-url">{{ productionUrl }}</code>.
        Check that the site is deployed and accessible.
      </p>
    </template>
    <UButton
      variant="soft"
      size="xs"
      icon="carbon:laptop"
      @click="previewSource = 'local'"
    >
      Switch to local
    </UButton>
  </DevtoolsError>
</template>

<style scoped>
.prod-url {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  background: var(--color-surface-sunken);
  border: 1px solid var(--color-border-subtle);
}
</style>

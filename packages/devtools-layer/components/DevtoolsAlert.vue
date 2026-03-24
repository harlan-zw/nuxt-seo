<script setup lang="ts">
const {
  icon,
  variant = 'info',
} = defineProps<{
  icon?: string
  variant?: 'info' | 'warning' | 'error' | 'success' | 'production'
}>()

const defaultIcons: Record<string, string> = {
  info: 'carbon:information',
  warning: 'carbon:warning',
  error: 'carbon:close-outline',
  success: 'carbon:checkmark-outline',
  production: 'carbon:cloud',
}
</script>

<template>
  <div class="devtools-alert" :class="`devtools-alert-${variant}`" :role="variant === 'error' ? 'alert' : 'status'">
    <UIcon :name="icon || defaultIcons[variant]" class="devtools-alert-icon" aria-hidden="true" />
    <div class="devtools-alert-content">
      <slot />
    </div>
    <div v-if="$slots.action" class="devtools-alert-action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.devtools-alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid var(--color-border);
}

.devtools-alert-icon {
  flex-shrink: 0;
}

.devtools-alert-content {
  flex: 1;
  min-width: 0;
}

.devtools-alert-action {
  margin-left: auto;
  flex-shrink: 0;
}

/* Info */
.devtools-alert-info {
  background: oklch(85% 0.1 230 / 0.1);
  color: oklch(55% 0.12 230);
  border-bottom-color: oklch(75% 0.1 230 / 0.2);
}

.dark .devtools-alert-info {
  background: oklch(45% 0.1 230 / 0.15);
  color: oklch(80% 0.1 230);
}

/* Error */
.devtools-alert-error {
  background: oklch(65% 0.18 25 / 0.1);
  color: oklch(52% 0.18 25);
  border-bottom-color: oklch(55% 0.15 25 / 0.25);
}

.dark .devtools-alert-error {
  background: oklch(40% 0.14 25 / 0.18);
  color: oklch(75% 0.14 25);
}

/* Warning */
.devtools-alert-warning {
  background: oklch(85% 0.12 85 / 0.1);
  color: oklch(55% 0.15 85);
  border-bottom-color: oklch(75% 0.12 85 / 0.2);
}

.dark .devtools-alert-warning {
  background: oklch(45% 0.12 85 / 0.15);
  color: oklch(80% 0.12 85);
}

/* Success */
.devtools-alert-success {
  background: oklch(75% 0.15 145 / 0.12);
  color: oklch(50% 0.15 145);
  border-bottom-color: oklch(65% 0.12 145 / 0.2);
}

.dark .devtools-alert-success {
  background: oklch(50% 0.15 145 / 0.15);
  color: oklch(75% 0.18 145);
}

/* Production */
.devtools-alert-production {
  background: oklch(85% 0.12 145 / 0.1);
  color: oklch(45% 0.15 145);
  border-bottom-color: oklch(75% 0.12 145 / 0.2);
}

.dark .devtools-alert-production {
  background: oklch(35% 0.08 145 / 0.15);
  color: oklch(75% 0.12 145);
}
</style>

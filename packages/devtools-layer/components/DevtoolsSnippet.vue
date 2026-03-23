<script setup lang="ts">
const {
  label,
  code,
  lang = 'js',
} = defineProps<{
  label?: string
  code: string
  lang?: 'js' | 'json' | 'xml'
}>()
</script>

<template>
  <div class="devtools-snippet">
    <div v-if="label || $slots.header" class="devtools-snippet-header">
      <slot name="header">
        <code class="devtools-snippet-label">{{ label }}</code>
      </slot>
      <DevtoolsCopyButton :text="code" />
    </div>
    <OCodeBlock :code="code" :lang="lang" class="devtools-snippet-block" />
  </div>
</template>

<style scoped>
.devtools-snippet {
  margin: 0.5rem 0.75rem;
}

.devtools-snippet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.devtools-snippet-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: -0.01em;
}

.devtools-snippet-block {
  border-radius: var(--radius-sm);
  font-size: 0.6875rem;
  line-height: 1.6;
  padding: 0.5rem 0.625rem !important;
}
</style>

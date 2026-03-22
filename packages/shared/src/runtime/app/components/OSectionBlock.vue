<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    icon?: string
    text?: string
    description?: string
    containerClass?: string
    headerClass?: string
    collapse?: boolean
    open?: boolean
    padding?: boolean | string
  }>(),
  {
    containerClass: '',
    open: true,
    padding: true,
    collapse: true,
  },
)

const open = useVModel(props, 'open')
function onToggle(e: any) {
  open.value = e.target.open
}
</script>

<template>
  <details :open="open" class="section-block" @toggle="onToggle">
    <summary class="section-header" :class="collapse ? '' : 'pointer-events-none'">
      <div class="section-title" :class="[open ? '' : 'opacity-60', headerClass]">
        <UIcon v-if="icon" :name="icon" class="section-icon" />
        <div class="flex-1 min-w-0">
          <div class="section-label">
            <slot name="text">
              {{ text }}
            </slot>
          </div>
          <div v-if="description || $slots.description" class="section-description">
            <slot name="description">
              {{ description }}
            </slot>
          </div>
        </div>
        <slot name="actions" />
        <UIcon
          v-if="collapse"
          name="carbon:chevron-down"
          class="chevron"
        />
      </div>
    </summary>
    <div
      class="section-content"
      :class="typeof padding === 'string' ? padding : padding ? 'px-4' : ''"
    >
      <slot name="details" />
      <div :class="containerClass">
        <slot />
      </div>
      <slot name="footer" />
    </div>
  </details>
</template>

<style scoped>
.section-block {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-elevated);
  transition: border-color 200ms ease;
}

.section-block:hover {
  border-color: var(--color-neutral-300);
}

.dark .section-block:hover {
  border-color: var(--color-neutral-700);
}

.section-header {
  cursor: pointer;
  user-select: none;
  padding: 0.875rem 1rem;
  transition: background 150ms ease;
  list-style: none;
}

.section-header::-webkit-details-marker {
  display: none;
}

.section-header:hover {
  background: var(--color-surface-sunken);
}

details[open] .section-header {
  border-bottom: 1px solid var(--color-border);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  transition: opacity 150ms ease;
}

.section-icon {
  color: var(--color-text-muted);
  font-size: 1.125rem;
  flex-shrink: 0;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

.section-description {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.125rem;
}

.chevron {
  color: var(--color-text-subtle);
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

details[open] .chevron {
  transform: rotate(180deg);
  color: var(--color-text-muted);
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--color-surface-sunken);
}
</style>

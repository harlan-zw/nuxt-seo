<script setup lang="ts">
const { requiredPending = 0, recommendedPending = 0 } = defineProps<{
  requiredPending?: number
  recommendedPending?: number
}>()
</script>

<template>
  <span
    v-if="requiredPending > 0 || recommendedPending > 0"
    class="checklist-badge"
    :class="requiredPending > 0 ? 'checklist-badge--required' : 'checklist-badge--recommended'"
  >
    {{ requiredPending + recommendedPending }}
  </span>
  <span v-else class="checklist-badge checklist-badge--complete">
    <UIcon name="carbon:checkmark" class="w-2.5 h-2.5" />
  </span>
</template>

<style scoped>
.checklist-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  border-radius: var(--radius-full, 9999px);
  font-size: 0.5625rem;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.checklist-badge--required {
  background: oklch(65% 0.18 25 / 0.15);
  color: oklch(55% 0.18 25);
}

.dark .checklist-badge--required {
  background: oklch(45% 0.14 25 / 0.2);
  color: oklch(72% 0.14 25);
}

.checklist-badge--recommended {
  background: oklch(80% 0.12 85 / 0.15);
  color: oklch(50% 0.15 85);
}

.dark .checklist-badge--recommended {
  background: oklch(50% 0.12 85 / 0.2);
  color: oklch(75% 0.12 85);
}

.checklist-badge--complete {
  background: oklch(75% 0.15 145 / 0.12);
  color: oklch(50% 0.15 145);
}

.dark .checklist-badge--complete {
  background: oklch(50% 0.15 145 / 0.15);
  color: oklch(75% 0.18 145);
}
</style>

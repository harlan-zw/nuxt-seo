<script setup lang="ts">
const { position } = defineProps<{
  position: number
}>()

const colorClass = computed(() => {
  if (position <= 3)
    return 'bg-amber-500/15 text-amber-400'
  if (position <= 10)
    return 'bg-blue-500/15 text-blue-400'
  return 'bg-neutral-500/15 text-neutral-400'
})
</script>

<template>
  <span
    class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium tabular-nums"
    :class="colorClass"
  >
    {{ position.toFixed(1) }}
  </span>
</template>

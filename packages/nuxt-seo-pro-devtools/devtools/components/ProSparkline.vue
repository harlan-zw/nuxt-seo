<script setup lang="ts">
const { values, color = '#3b82f6', width = 120, height = 32 } = defineProps<{
  values: number[]
  color?: string
  width?: number
  height?: number
}>()

const points = computed(() => {
  if (!values.length)
    return ''
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const stepX = width / Math.max(values.length - 1, 1)
  const padding = 2

  return values.map((v, i) => {
    const x = i * stepX
    const y = padding + (height - 2 * padding) * (1 - (v - min) / range)
    return `${x},${y}`
  }).join(' ')
})

const fillPoints = computed(() => {
  if (!points.value)
    return ''
  return `0,${height} ${points.value} ${width},${height}`
})
</script>

<template>
  <svg :width="width" :height="height" class="overflow-visible">
    <defs>
      <linearGradient :id="`spark-fill-${color}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.15" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon
      v-if="fillPoints"
      :points="fillPoints"
      :fill="`url(#spark-fill-${color})`"
    />
    <polyline
      v-if="points"
      :points="points"
      fill="none"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

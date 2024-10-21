<script setup lang="ts">
import { computed, inject, ref, useTemplateRef } from 'vue'

defineProps<{
  icon: string
}>()

const iconRef = useTemplateRef('icon')

const mouseY = inject('mouseY', ref(Infinity))
const mouseX = inject('mouseX', ref(Infinity))
const magnification = inject('magnification', 60)
const distance = inject('distance', 100)

const baseWidth = 100

function calculateXDistance(val: number) {
  const bounds = iconRef.value?.getBoundingClientRect() || { x: 0, width: 0 }
  return val - bounds.x - bounds.width / 2
}

function calculateYDistance(val: number) {
  const bounds = iconRef.value?.getBoundingClientRect() || { y: 0, height: 0 }
  return val - bounds.y - bounds.height / 2
}

const margin = computed(() => {
  if (mouseX.value === Infinity) {
    return { }
  }
  // we want to move the icon to offset the width / height changes
  const distanceXCalc = calculateXDistance(mouseX.value)
  const distanceYCalc = calculateYDistance(mouseY.value)
  const marginLeft = Math.abs(distanceXCalc) < distance ? `-${Math.round(distanceXCalc - distance)}px` : 0
  const marginTop = Math.abs(distanceYCalc) < distance ? `-${Math.round(distanceYCalc - distance)}px` : 0
  return { transform: `translate(${marginLeft}, ${marginTop})` }
})

const iconWidth = computed(() => {
  if (mouseX.value === Infinity) {
    return baseWidth
  }
  const distanceCalc = calculateXDistance(mouseX.value)

  if (Math.abs(distanceCalc) < distance) {
    return (1 - Math.abs(distanceCalc) / distance) * magnification + baseWidth
  }

  return baseWidth
})

const iconHeight = computed(() => {
  if (mouseX.value === Infinity) {
    return baseWidth
  }
  const distanceCalc = calculateYDistance(mouseY.value)

  if (Math.abs(distanceCalc) < distance) {
    return (1 - Math.abs(distanceCalc) / distance) * magnification + baseWidth
  }

  return baseWidth
})

const iconColor = computed(() => {
  if (mouseX.value === Infinity) {
    return 'text-blue-300'
  }
  // should be between 300-900 depending on how close the mouse is to the element
  const distanceCalc = Math.min(
    Math.abs(calculateXDistance(mouseX.value)),
    Math.abs(calculateYDistance(mouseY.value)),
  )
  const color = Math.round((1 - distanceCalc / distance) * 600 + 300)
  const clampedColor = Math.min(900, Math.max(300, color))
  // whitelist: text-blue-300, text-blue-400, text-blue-500, text-blue-600, text-blue-700, text-blue-800, text-blue-900
  return `text-blue-${clampedColor}`
})
</script>

<template>
  <div
    ref="icon"
    v-motion
    class="flex aspect-square cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out"
    :style="{
      ...margin,
      width: `${iconWidth}px`,
      height: `${iconHeight}px`,
    }"
  >
    <div>
      <UIcon
        dynamic :name="icon" :style="{
          width: `${iconWidth}px`,
          height: `${iconHeight}px`,
        }"
        class="transition-all transition-duration-100"
        :class="iconColor"
      />
      <slot />
    </div>
  </div>
</template>

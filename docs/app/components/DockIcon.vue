<script setup lang="ts">
import { computed, inject, ref, useTemplateRef } from 'vue'

defineProps<{
  icon: string
}>()

const iconRef = useTemplateRef('icon')

const mouseY = inject('mouseY', ref(Infinity))
const mouseX = inject('mouseX', ref(Infinity))
const magnification = inject('magnification', 60)
const distance = inject('distance', 140)

const margin = ref(0)
const baseWidth = 100

function calculateXDistance(val: number) {
  const bounds = iconRef.value?.getBoundingClientRect() || { x: 0, width: 0 }
  return val - bounds.x - bounds.width / 2
}

function calculateYDistance(val: number) {
  const bounds = iconRef.value?.getBoundingClientRect() || { y: 0, height: 0 }
  return val - bounds.y - bounds.height / 2
}

const iconWidth = computed(() => {
  const distanceCalc = calculateXDistance(mouseX.value)

  if (Math.abs(distanceCalc) < distance) {
    return (1 - Math.abs(distanceCalc) / distance) * magnification + baseWidth
  }

  return baseWidth
})

const iconHeight = computed(() => {
  const distanceCalc = calculateYDistance(mouseY.value)

  if (Math.abs(distanceCalc) < distance) {
    return (1 - Math.abs(distanceCalc) / distance) * magnification + baseWidth
  }

  return baseWidth
})
</script>

<template>
  <div
    ref="icon"
    v-motion
    class="flex aspect-square cursor-pointer items-center justify-center rounded-full transition-all duration-200 ease-out"
    :style="{
      width: `${iconWidth}px`,
      height: `${iconHeight}px`,
    }"
    :hovered="{
      marginLeft: margin,
      marginRight: margin,
    }"
  >
    <div>
      <UIcon
        dynamic :name="icon" :style="{
          width: `${iconWidth}px`,
          height: `${iconHeight}px`,
        }" class="text-blue-300 h-full"
      />
      <slot />
    </div>
  </div>
</template>

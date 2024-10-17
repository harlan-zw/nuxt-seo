<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps({
  class: {
    type: String,
    default: '',
  },
  magnification: {
    type: Number,
    default: 60,
  },
  distance: {
    type: Number,
    default: 140,
  },
  direction: {
    type: String,
    default: 'middle',
  },
})

const dockRef = ref<HTMLElement | null>(null)
const mouseX = ref(Infinity)
const mouseY = ref(Infinity)

const dockClass = computed(() => ({
  'items-start': props.direction === 'top',
  'items-center': props.direction === 'middle',
  'items-end': props.direction === 'bottom',
}))

function onMouseMove(e: MouseEvent) {
  requestAnimationFrame(() => {
    mouseX.value = e.pageX
    mouseY.value = e.pageY
  })
}

function onMouseLeave() {
  mouseX.value = Infinity
  mouseY.value = Infinity
}

provide('mouseY', mouseY)
provide('mouseX', mouseX)
provide('magnification', props.magnification)
provide('distance', props.distance)
</script>

<template>
  <div
    ref="dockRef"
    :class="
      cn(
        'supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-[50px] w-max rounded-2xl p-2 backdrop-blur-md transition-all',
        $props.class,
        dockClass,
      )
    "
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
  >
    <slot />
  </div>
</template>

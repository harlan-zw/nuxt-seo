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

const dockRef = useTemplateRef<HTMLElement | null>('dockRef')
const mouseX = ref<number>()
const mouseY = ref<number>()

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

provide('mouseY', mouseY)
provide('mouseX', mouseX)
provide('magnification', props.magnification)
provide('distance', props.distance)

const { isOutside } = useMouseInElement(dockRef)

watch(isOutside, (val) => {
  if (val) {
    mouseX.value = false
    mouseY.value = false
  }
})
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
  >
    <slot />
  </div>
</template>

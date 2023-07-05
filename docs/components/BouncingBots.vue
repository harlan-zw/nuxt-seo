<script lang="ts" setup>
import { onMounted, ref, useElementHover, useIntervalFn, watch } from '#imports'

const props = defineProps<{
  icon: string
  interval: number
}>()

const robotsInject = inject('robots')

const container = ref()

// we're not moving anywhere
const direction = {
  x: Math.random() > 0.5 ? 1 : -1,
  y: Math.random() > 0.5 ? 1 : -1,
}

const pos = {
  x: 0,
  y: 0,
}

const size = {
  // tiny buffer
  width: 33,
  height: 33,
}

const styles = ref({
  opacity: 0,
  transform: '',
})
let rotation = 0
let speed = 0

const isHovered = ref(robotsInject.value.hover)

onMounted(() => {
  // parent node for bounding box
  const parentNode = container.value.parentNode
  // hover requires a class
  const parentHover = useElementHover(container.value.closest('.showcase-card'))
  watch(parentHover, () => {
    isHovered.value = parentHover.value
  })
  const { width, height } = parentNode.getBoundingClientRect()
  // set facing rotation, should be 0, 90, 180, 270
  rotation = 0
  // start in a random spot
  pos.x = Math.min(Math.random() * width, width - size.width)
  pos.y = Math.min(Math.random() * height, height - size.height)
  // start at a speed between 1-3
  speed = 0
  // start by assigning a reandom diagonal direction to head towards
  direction.x = Math.random() > 0.5 ? -1 : -1
  direction.y = Math.random() > 0.5 ? 1 : -1
  const { pause, resume } = useIntervalFn(() => {
    speed = Math.min(speed + 0.005 + Math.random() * 0.005, 2.5)
    // do the movement
    pos.x += (direction.x * speed)
    pos.y += (direction.y * speed)
    // we want to create a DVD screensaver effect, we move diagonally until we hit a wall then we bounce off of it
    // travel diagonally, each time we hit the corner, add a carriage
    // if we hit the top or bottom, reverse the y direction
    // if we hit the left or right, reverse the x direction
    if (pos.x + size.width > width) {
      rotation = 90
      direction.x *= -1
    }
    if (pos.x < 0) {
      rotation = 270
      direction.x *= -1
    }
    if (pos.y + size.height > height) {
      rotation = 0
      direction.y *= -1
    }
    if (pos.y < 0) {
      rotation = 180
      direction.y *= -1
    }
    const stylesTmp: Record<string, any> = {}
    // apply transform style to container
    if (rotation === 180) {
      // we need to flip instread
      stylesTmp.transform = `translate(${pos.x}px, ${pos.y}px) rotateX(${rotation}deg)`
    }
    else {
      stylesTmp.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${rotation}deg)`
    }
    stylesTmp.opacity = Math.min(styles.value.opacity + 0.01 + Math.random() * 0.01, 1)
    styles.value = stylesTmp
  }, props.interval, {
    immediate: isHovered.value,
  })

  watch(parentHover, (hovered) => {
    if (hovered) {
      resume()
      robotsInject.value.hover = true
    }
    else {
      robotsInject.value.hover = false
      pause()
      rotation = 0
      // start in a random spot
      // pos.x = Math.random() * width - size.width
      // pos.y = Math.random() * height - size.height
      // start by assigning a reandom diagonal direction to head towards
      // direction.x = Math.random() > 0.5 ? -1 : -1
      // direction.y = Math.random() > 0.5 ? 1 : -1
      speed = 0
      styles.value = {
        opacity: 0,
        transform: styles.value.transform,
      }
    }
  })
})
</script>

<template>
  <div ref="container" class="absolute top-0 left-0">
    <Icon :name="icon" size="30" class="transition-opacity" :style="styles" />
  </div>
</template>

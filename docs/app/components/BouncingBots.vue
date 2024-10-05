<script lang="ts" setup>
import { onMounted, ref, useElementHover, useIntervalFn, watch } from '#imports'
import { useMouseInElement } from '@vueuse/core'

defineProps<{
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
  const { elementX: mouseX, elementY: mouseY } = useMouseInElement(parentNode)

  // set facing rotation, should be 0, 90, 180, 270
  rotation = 0
  // start in a random spot
  pos.x = Math.min(Math.random() * width, width - size.width)
  pos.y = Math.min(Math.random() * height, height - size.height)
  // start at a speed between 1-3
  speed = 0
  const maxSpeed = Math.random() * 2 + 3
  // start by assigning a reandom diagonal direction to head towards
  direction.x = Math.random() > 0.5 ? -1 : -1
  direction.y = Math.random() > 0.5 ? 1 : -1
  let isEvadingMouse = false
  const { pause, resume } = useIntervalFn(() => {
    // increase speed if it's not at max
    if (speed < maxSpeed)
      speed += 0.1

    // if it's too fast, slow it down
    if (speed > maxSpeed)
      speed -= 0.1
    // do the movement
    pos.x += Math.round(direction.x * speed)
    pos.y += Math.round(direction.y * speed)
    // we want to create a DVD screensaver effect, we move diagonally until we hit a wall then we bounce off of it
    // travel diagonally, each time we hit the corner, add a carriage
    // if we hit the top or bottom, reverse the y direction
    // if we hit the left or right, reverse the x direction
    // only if the direction is still heading out of bounds
    if (pos.x + size.width > width && direction.x === 1) {
      rotation = 90
      direction.x *= -1
      // only if we're not going 1.5x the max speed, increase the speed for a bounce effect
      speed = Math.min(speed + maxSpeed * 1.5, maxSpeed * 1.5)
    }
    if (pos.x < 0 && direction.x === -1) {
      rotation = 270
      direction.x *= -1
      speed = Math.min(speed + maxSpeed * 1.5, maxSpeed * 1.5)
    }
    if (pos.y + size.height > height && direction.y === 1) {
      rotation = 0
      direction.y *= -1
      speed = Math.min(speed + maxSpeed * 1.5, maxSpeed * 1.5)
    }
    if (pos.y < 0 && direction.y === -1) {
      rotation = 180
      direction.y *= -1
      speed = Math.min(speed + maxSpeed * 1.5, maxSpeed * 1.5)
    }
    // also collide with the mouse
    if (pos.x < mouseX.value && pos.x + size.width > mouseX.value && pos.y < mouseY.value && pos.y + size.height > mouseY.value) {
      if (isEvadingMouse)
        return

      // we're colliding with the mouse, so we need to bounce off of it
      // we need to figure out which side we're colliding with
      // we can do this by figuring out which side is closer
      const xDist = Math.min(Math.abs(pos.x - mouseX.value), Math.abs(pos.x + size.width - mouseX.value))
      const yDist = Math.min(Math.abs(pos.y - mouseY.value), Math.abs(pos.y + size.height - mouseY.value))
      if (xDist < yDist) {
        // we're colliding with the left or right side
        direction.x *= -1
        rotation = 90
      }
      else {
        // we're colliding with the top or bottom side
        direction.y *= -1
        rotation = 0
      }
      isEvadingMouse = true
      robotsInject.value.collisions += 1
      speed = Math.min(speed + maxSpeed * 1.5, maxSpeed * 1.5)
    }
    else {
      isEvadingMouse = false
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
  }, 1000 / 30 /* 30 fps */, {
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
    <UIcon dynamic :name="icon" size="30" class="transition-opacity" :style="styles" />
  </div>
</template>

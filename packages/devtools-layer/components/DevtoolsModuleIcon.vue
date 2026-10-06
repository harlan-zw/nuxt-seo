<script setup lang="ts">
import type { BrandIconName, BrandLanding } from 'nuxtseo-shared/brand'
import { drawingToSvg, iconDrawing } from 'nuxtseo-shared/brand'
import { computed } from 'vue'

const { name, landing = 'free', size = 18 } = defineProps<{
  name: BrandIconName
  landing?: BrandLanding
  /** Rendered size in pixels. Small sizes get a heavier pen and a bigger dot. */
  size?: number
}>()

// Trusted static markup: drawingToSvg only interpolates the brand's own path data.
const svg = computed(() => drawingToSvg(iconDrawing(name, { landing, size }), { width: size, height: size }))
</script>

<template>
  <span class="devtools-module-icon" aria-hidden="true" v-html="svg" />
</template>

<style scoped>
.devtools-module-icon {
  display: inline-flex;
  flex: none;
  line-height: 0;
}
</style>

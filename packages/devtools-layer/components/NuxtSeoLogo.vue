<script setup lang="ts">
import { drawingToSvg, markDrawing } from 'nuxtseo-shared/brand'

// Trusted static markup from the brand module.
const mark = drawingToSvg(markDrawing({ size: 28 }), { width: 28, height: 28 })
</script>

<template>
  <div class="nuxt-seo-logo">
    <span class="nuxt-seo-logo-mark" aria-hidden="true" v-html="mark" />
    <span class="nuxt-seo-logo-word">
      <span class="font-medium">Nuxt</span> <span class="font-bold">SEO</span>
    </span>
  </div>
</template>

<style scoped>
.nuxt-seo-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
}

.nuxt-seo-logo-mark {
  display: inline-flex;
  height: 100%;
  aspect-ratio: 1;
}

.nuxt-seo-logo-mark :deep(svg) {
  width: 100%;
  height: 100%;
}

.nuxt-seo-logo-word {
  font-family: var(--font-sans);
  font-size: 1.125rem;
  letter-spacing: -0.03em;
  white-space: nowrap;
}
</style>

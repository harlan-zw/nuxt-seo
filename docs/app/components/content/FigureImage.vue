<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<script lang="ts" setup>
const props = withDefaults(defineProps<{
  alt: string
  src: string
  lazy?: boolean | 'false' | 'true'
  width?: number
  figureClass?: string
}>(), {
  lazy: true,
})

const loadingType = computed(() => {
  return props.lazy ? 'lazy' : 'eager'
})
</script>

<template>
  <figure class="figure-image flex flex-col items-center justify-center mx-auto max-w-full my-2">
    <img
      v-bind="$attrs"
      height="700"
      :alt="alt"
      :width="width"
      :src="src"
      :loading="loadingType"
    >
    <figcaption v-if="alt" class="text-center">
      {{ alt }}
    </figcaption>
  </figure>
</template>

<style>
@media(max-width: 1024px) {
  .figure-image {
    transform: translateX(0) !important;
  }
}

.figure-image :deep(img:not([src$=".svg"])) {
  width: auto;
  border-radius: 0.5em;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 10px 0 rgba(0, 0, 0, 0.05);
  max-height: min(65vh, 700px);
  margin: 0 auto;
}
</style>

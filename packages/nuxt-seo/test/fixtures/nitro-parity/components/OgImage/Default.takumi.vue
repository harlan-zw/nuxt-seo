<script setup lang="ts">
import { useRequestHeader } from '#imports'

withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Nuxt SEO compatibility',
})

if (useRequestHeader('x-og-image-test') !== 'forwarded')
  throw new Error('OG image island request did not preserve request headers')
</script>

<template>
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; background: #020420; color: white;">
    <h1 style="font-size: 64px;">
      {{ title }}
    </h1>
  </div>
</template>

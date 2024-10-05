<script setup lang="ts">
import type { MediaPhoto } from '../utils'
import { getMediaUrl } from '../utils'

defineProps<{
  media: MediaPhoto
}>()
</script>

<template>
  <img
    loading="lazy"
    style="object-fit: cover; height: 100%; max-width: 100%; aspect-ratio: 2/1; width: 314px;"
    :src="getMediaUrl(media, 'small')"
  >
</template>

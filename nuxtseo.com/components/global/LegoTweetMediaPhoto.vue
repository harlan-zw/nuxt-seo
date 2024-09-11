<script setup lang="ts">
import type { MediaPhoto } from 'lego/types'
import { getMediaUrl } from 'lego/utils/twitter'

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

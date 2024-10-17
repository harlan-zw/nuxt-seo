<script setup lang="ts">
import type { MediaVideo } from '../utils'
import { getMediaUrl } from '../utils'

defineProps<{
  media: MediaVideo
}>()
</script>

<template>
  <video
    v-if="media"
    :poster="getMediaUrl(media, 'small')"
    draggable
    muted
    preload="metadata"
  >
    <source
      :src="media.url"
      :type="media.video_info.variants?.[0].content_type"
    >
  </video>
</template>

<script setup lang="ts">
const { url } = defineProps<{
  url: string
}>()
</script>

<template>
  <div class="h-full max-h-full overflow-hidden">
    <iframe :src="url" :title="`Documentation - ${url}`" class="w-full h-full border-none" style="min-height: calc(100vh - 100px);" />
  </div>
</template>

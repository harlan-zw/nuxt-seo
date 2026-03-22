<script setup lang="ts">
defineProps<{ title?: string, description?: string }>()
</script>

<template>
  <div class="w-full h-full flex items-center justify-center bg-white">
    <div class="text-center">
      <h1 class="text-6xl font-bold">
        {{ title || 'Default OG Image' }}
      </h1>
      <p v-if="description" class="text-2xl mt-4 text-gray-600">
        {{ description }}
      </p>
    </div>
  </div>
</template>

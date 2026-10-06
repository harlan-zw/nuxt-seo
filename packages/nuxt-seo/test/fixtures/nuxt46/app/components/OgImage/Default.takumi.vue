<script setup lang="ts">
withDefaults(defineProps<{ title?: string }>(), { title: 'Combined SEO' })
</script>

<template>
  <div style="display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; background: #020420; color: white;">
    <h1 style="font-size: 64px;">{{ title }}</h1>
  </div>
</template>

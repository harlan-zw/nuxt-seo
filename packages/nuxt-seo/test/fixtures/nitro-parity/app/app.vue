<script setup lang="ts">
useSeoMeta({
  title: 'Compatibility',
  description: 'Nuxt SEO compatibility fixture.',
})

defineOgImage('Default', {
  title: 'Nuxt SEO compatibility',
})

useSchemaOrg([
  defineWebSite({
    name: 'Nuxt SEO Compatibility',
  }),
])
</script>

<template>
  <main>
    <h1>Nuxt SEO compatibility</h1>
  </main>
</template>

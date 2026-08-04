<script setup lang="ts">
useSeoMeta({
  title: 'Compatibility',
  description: 'Nuxt SEO running on Nitro 3.',
})

defineOgImage('Default', {
  title: 'Nuxt SEO on Nitro 3',
})

useSchemaOrg([
  defineWebSite({
    name: 'Nuxt SEO Nitro 3',
  }),
])
</script>

<template>
  <main>
    <h1>Nuxt SEO Nitro 3 compatibility</h1>
  </main>
</template>

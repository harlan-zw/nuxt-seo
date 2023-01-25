<script lang="ts" setup>
definePageMeta({
  title: 'About',
  description: 'My description',
  image: 'https://example.com/image.jpg',
})


defineOgImageStatic({
  title: 'About',
  description: 'My description',
  customSomething: 'custom',
})
</script>
<template>
  <div>
    <div>
      <NuxtLink to="/">home</NuxtLink>
      About page
    </div>
  </div>
</template>

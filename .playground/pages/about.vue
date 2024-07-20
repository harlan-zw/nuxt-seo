<script lang="ts" setup>
import { definePageMeta, defineOgImage } from '#imports'

definePageMeta({
  title: 'About',
  description: 'My description',
  image: 'https://example.com/image.jpg',
})

defineOgImage({
  title: 'About',
  description: 'My description',
  customSomething: 'custom',
})
</script>

<template>
  <div>
    <div>
      <NuxtLink to="/">
        home
      </NuxtLink>
      About page
    </div>
  </div>
</template>

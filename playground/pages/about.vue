<script lang="ts" setup>
import { defineOgImage } from '#imports'

definePageMeta({
  title: 'About',
  description: 'My description',
  image: 'https://example.com/image.jpg',
})

// @ts-expect-error playground component
defineOgImage('OgImageDefault.satori', {
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

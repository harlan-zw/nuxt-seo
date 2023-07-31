<script lang="ts" setup>
import { definePageMeta, useHead } from '#imports'

definePageMeta({
  breadcrumbTitle: 'Home',
  image: '/images/og-image.png'
})

useHead({
  title: null,
})
</script>
<template>
<div>
  <h1>Hello world</h1>
  <p>Welcome to my website</p>
  <div>
    <NuxtLink to="/abott">new title</NuxtLink>
  </div>
  <div>
    <NuxtLink to="/no-set-title">/no-set-title</NuxtLink>
  </div>
</div>
</template>

<script lang="ts" setup>
import { definePageMeta, useHead } from '#imports'

definePageMeta({
  breadcrumbTitle: 'Home',
  image: '/images/og-image.png'
})

useHead({
  title: 'hello',
  titleTemplate: '%s - %site.name'
})
</script>
<template>
<div>
  <h1>Hello world</h1>
  <p>Welcome to my website</p>
  <div>
    <NuxtLink to="/about">new title</NuxtLink>
  </div>
</div>
</template>

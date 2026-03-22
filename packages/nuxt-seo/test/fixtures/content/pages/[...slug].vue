<script setup lang="ts">
// @ts-ignore
import { defineOgImage, queryCollection, useRoute } from '#imports'

const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})
useSeoMeta({
  title: (page.value as any)?.seo?.title || 'Nuxt OG Image',
  description: (page.value as any)?.seo?.description || 'The quickest and easiest way to build Open Graph images for Nuxt.',
})
if ((page.value as any)?.ogImage) {
  defineOgImage((page.value as any).ogImage)
}
</script>

<template>
  <div>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
    <div v-else>
      Page not found
    </div>
  </div>
</template>

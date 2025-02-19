<script setup lang="ts">
import { queryCollection, useRoute } from '#imports'

const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})
useSeoMeta({
  title: page.value?.seo?.title || 'Nuxt OG Image',
  description: page.value?.seo?.description || 'The quickest and easiest way to build Open Graph images for Nuxt.',
})
if (page.value.ogImage) {
  defineOgImage(page.value.ogImage)
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

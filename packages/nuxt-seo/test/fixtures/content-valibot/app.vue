<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(() => route.path, () => queryCollection('content').path(route.path).first())

useHead(() => page.value?.head || {})
useSeoMeta({
  robots: () => page.value?.seo?.robots,
})
if (page.value?.ogImage?.url)
  defineOgImage('ContentCard', {}, { url: page.value.ogImage.url })
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>

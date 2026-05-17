<script setup lang="ts">
const route = useRoute()

const { data: page } = await useAsyncData(`page-${route.path}`, () => {
  return queryCollection('content').path(route.path).first()
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})

defineOgImage('NuxtSeo')
</script>

<template>
  <article>
    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </article>
</template>

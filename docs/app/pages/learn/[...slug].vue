<script setup lang="ts">
definePageMeta({
  layout: 'learn',
})

const route = useRoute()

// collection is the path segment after /docs/<collection>/<page>
// const collection = computed(() => camelCase(route.path.split('/')[2]))
const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection('learn').path(route.path).first()),
  useAsyncData(`docs-${route.path}-surround`, () => queryCollectionItemSurroundings('learn', route.path, {
    fields: ['title', 'description', 'navigation'],
    transform(items) {
      return items.map((m) => {
        return {
          ...m,
          _path: m.path,
        }
      })
    },
  })),
])
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

useSeoMeta({
  title: () => page.value?.title || '',
  description: () => page.value?.description,
})

defineOgImageComponent('NuxtSeo', {
  title: page.value?.title || '',
  description: page.value?.description,
})

const repoLinks = computed(() => [
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/harlan-zw/nuxt-seo/edit/main/docs/content/learn/${page.value._id.split('/').slice(2).join('/')}`,
    target: '_blank',
  },
])
</script>

<template>
  <div class="max-w-[66ch]">
    <UPageHeader v-bind="page" :ui="{ title: 'text-center text-balance xl:leading-normal min-w-full', description: 'text-center ' }">
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length" :links="page.body?.toc?.links" class="mt-7" />
      </div>
    </UPageHeader>

    <UPageBody prose class="pb-0">
      <div class="xl:fixed my-5 block w-[200px] bottom-5 right-5">
        <Ads />
      </div>
      <ContentRenderer v-if="page.body" :value="page" />
      <div class="justify-center flex items-center gap-2 font-semibold">
        <UIcon name="i-simple-icons-github" class="w-5 h-5" />
        <NuxtLink v-bind="repoLinks[0]" class="hover:underline">
          {{ repoLinks[0].label }}
        </NuxtLink>
      </div>
      <hr v-if="surround?.length" class="my-8">
      <UContentSurround :surround="surround" />
    </UPageBody>
  </div>
</template>

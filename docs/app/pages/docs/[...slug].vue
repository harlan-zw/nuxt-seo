<script setup lang="ts">
import type { Collections } from '@nuxt/content'
import { camelCase } from 'scule'
import { useModule } from '~/composables/module'

definePageMeta({
  layout: 'docs',
})

const route = useRoute()
const module = useModule()

const collection = camelCase(module.value.slug) as keyof Collections

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection(collection).path(route.path).first()),
  useAsyncData(`docs-${route.path}-surround`, () => queryCollectionItemSurroundings(collection, route.path, {
    fields: ['title', 'description', 'path'],
  }), {
    transform(items) {
      return items.map((m) => {
        return {
          ...m,
          _path: m.path,
        }
      })
    },
  }),
])
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

useSeoMeta({
  title: () => page.value?.title || '',
  description: () => page.value?.description,
})

const headline = ''

defineOgImageComponent('Module', {
  title: page.value?.title || '',
  moduleName: module.value?.repo.replace('harlan-zw/', ''),
  description: page.value?.description,
  ...module.value,
})

const repoLinks = computed(() => [
  {
    label: 'Edit this page',
    to: `https://github.com/${module.value.repo}/edit/main/docs/content/${page.value.contentId.split('/').slice(3).join('/')}`,
    target: '_blank',
  },
])
</script>

<template>
  <div class="max-w-[66ch]">
    <UPageHeader :title="page.title" :description="page.description" :headline="headline" class="text-balance">
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length > 1" :links="page.body?.toc?.links" class="mt-7" />
      </div>
    </UPageHeader>

    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="page.body" :value="page" />
      <div class="justify-center flex items-center gap-2 font-semibold">
        <UIcon name="i-simple-icons-github" class="w-5 h-5" />
        <NuxtLink v-bind="repoLinks[0]" class="hover:underline">
          {{ repoLinks[0].label }}
        </NuxtLink>
      </div>
      <USeparator v-if="surround?.length" class="my-8" />
      <UContentSurround :surround="surround" />
      <div class="lg:hidden">
        <Ads class="my-5" />
      </div>
    </UPageBody>
  </div>
</template>

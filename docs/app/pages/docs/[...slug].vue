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
if (!collection)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

const start = Date.now()
const e = useRequestEvent()
const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection(collection).path(route.path).first()).then(v => {
    // set server timings
    if (import.meta.server) {
      setHeader(e, 'X-Content-Timing', Date.now() - start)
      appendHeader(e, 'Server-Timing', `docs;dur=${Date.now() - start}`)
    }
    return v
  }),
  useAsyncData(`docs-${route.path}-surround`, () => queryCollectionItemSurroundings(collection, route.path, {
    fields: ['title', 'description', 'path'],
  }).then(v => {
    if (import.meta.server) {
      setHeader(e, 'X-Content-Surround-Timing', Date.now() - start)
      appendHeader(e, 'Server-Timing', `docs-surround;dur=${Date.now() - start}`)
    }
    return v
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
    to: `https://github.com/${module.value.repo}/edit/main/docs/content/${page.value._id.split('/').slice(3).join('/')}`,
    target: '_blank',
  },
])
</script>

<template>
  <div class="max-w-[66ch] ml-auto md:ml-0 md:mr-auto">
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
      <FeedbackButtons :edit-link="repoLinks[0].to" />
      <USeparator v-if="surround?.length" class="my-8" />
      <UContentSurround :surround="surround" />
      <div class="xl:hidden">
        <Ads class="my-5" />
      </div>
    </UPageBody>
  </div>
</template>

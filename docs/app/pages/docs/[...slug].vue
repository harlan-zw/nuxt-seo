<script setup lang="ts">
definePageMeta({
  layout: 'docs',
})

const route = useRoute()
const segment = computed(() => route.path.split('/')[1])

const modules = inject('modules')

const version = computed(() => {
  const m = modules.find(l => l?.slug === segment.value)
  if (!m)
    return ''
  if (m?.slug === 'nuxt-seo')
    return '2'
  if (m.tag?.label) {
    const v = m.tag.label.replace('^', '')
    // we want only the major and minor versions, drop patch
    return v.split('.').slice(0, 2).join('.')
  }
  return ''
})

// collection is the path segment after /docs/<collection>/<page>
// const collection = computed(() => camelCase(route.path.split('/')[2]))
const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryCollection('docs').path(route.path).first()),
  useAsyncData(`docs-${route.path}-surround`, () => queryCollectionItemSurroundings('docs', route.path, {
    fields: ['title', 'description'],
  })),
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
  stars: module.value?.stars,
  downloads: module.value?.downloads,
  version: version.value,
})

const repoLinks = computed(() => [
  // {
  //   icon: 'i-ph-github-logo',
  //   label: 'Open an issue',
  //   to: `https://github.com/${module.value?.repo}/issues/new/choose`,
  //   target: '_blank',
  // },
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/harlan-zw/nuxt-seo/edit/v2/docs/content/${page?.value?._file}`,
    target: '_blank',
  },
])
</script>

<template>
  <div class="max-w-[66ch]">
    <UPageHeader :title="page.title" :description="page.description" :links="page.links" :headline="headline">
      <template #headline>
        <div class="w-full flex items-center justify-between">
          <div>{{ headline }}</div>
          <UPageLinks v-if="module" :ui="{ container: 'gap-7' }" :links="repoLinks" />
        </div>
      </template>
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length" :links="page.body?.toc?.links" class="mt-7" />
      </div>
    </UPageHeader>

    <UPageBody prose class="pb-0">
      <ContentRenderer v-if="page.body" :value="page" />
      <hr v-if="surround?.length" class="my-8">
      <UContentSurround :surround="surround" />
      <div class="lg:hidden">
        <Ads class="my-5" />
      </div>
    </UPageBody>
  </div>
</template>

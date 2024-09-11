<script setup lang="ts">
import { findPageHeadline, mapContentNavigation, useModuleList } from '#imports'

const route = useRoute()
const segment = computed(() => route.path.split('/')[1])

const children = inject<Ref<NavItem[]>>('docsAsideLinks')
console.log(children.value)
const module = inject('module')

const version = computed(() => {
  const m = useModuleList().find(l => l?.slug === segment.value)
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

const [{ data: page }, { data: surround }] = await Promise.all([
  useAsyncData(`docs-${route.path}`, () => queryContent(route.path).findOne()),
  useAsyncData(`docs-${route.path}-surround`, () => queryContent()
    .only(['_path', 'title', 'navigation', 'description'])
    .where({ _extension: 'md', navigation: { $ne: false } })
    .findSurround(route.path.endsWith('/') ? route.path.slice(0, -1) : route.path)),
])
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })

useSeoMeta({
  title: () => page.value?.title || '',
  description: () => page.value?.description,
})

const headline = computed(() => findPageHeadline(page.value))

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
  <UContainer>
    <UMain class="relative flex gap-[80px]">
      <UAside class="!pr-7 !py-3 w-[23ch]">
        <template #top>
          <div>
            <div v-if="module?.slug !== 'nuxt-seo'">
              <div class="flex mb-2 gap-2">
                <UIcon dynamic :name="module.icon" class="w-9 h-9 dark:text-blue-400 text-blue-500 group-hover:text-blue-500 transition-all" />
                <div class="gap-2">
                  <div class="text-sm text-center text-gray-600 dark:text-gray-300 w-full">
                    <template v-if="module.slug !== 'nuxt-seo'">
                      {{ module.label }}
                    </template>
                    <template v-else>
                      Nuxt SEO
                    </template>
                  </div>
                  <a :href="`https://www.npmjs.com/package/${module.npm ? module.npm : `nuxt-${module.id}`}`" target="_blank" title="View on NPM" class="flex justify-between text-right">
                    <div class="mb-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap font-light items-center flex">
                      <div>{{ version }}</div>
                    </div>
                  </a>
                </div>
              </div>
              <div v-if="module.downloads && module.stars" class="dark:text-gray-400 text-gray-500 mb-3">
                <div class="text-xs flex gap-2">
                  <a :href="`https://www.npmjs.com/package/${module.npm ? module.npm : `nuxt-${module.id}`}`" target="_blank" title="View on NPM" class="">
                    <div class=" text-sm font-light items-center flex">
                      <UIcon name="i-carbon-chart-line-smooth" class="h-4 w-4 mr-1 opacity-50" />
                      <div>{{ module.downloads }}</div>
                    </div>
                  </a>
                  <a v-if="module.repo !== 'harlan-zw/nuxt-seo'" :href="`http://github.com/${module.repo}`" target="_blank" title="Star on GitHub" class="">
                    <div class="text-sm font-light items-center flex">
                      <UIcon name="i-carbon-star" class="h-4 w-4 mr-1 opacity-50" />
                      {{ module.stars }}
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </template>
        <UDivider type="dashed" class="mb-6" />
        <DocsSearchButton class="mb-3 w-full" />
        <UNavigationTree v-if="children" default-open :multiple="false" :links="mapContentNavigation(children)" />
      </UAside>
      <div class="max-w-[66ch]">
        <UPage :ui="{ wrapper: 'xl:gap-18' }">
          <UPageHeader :title="page.title" :description="page.description" :links="page.links" :headline="headline">
            <template #headline>
              <div class="w-full flex items-center justify-between">
                <div>{{ headline }}</div>
                <UPageLinks v-if="module" :ui="{ container: 'gap-7' }" :links="repoLinks" />
              </div>
            </template>
            <TableOfContents v-if="page.body?.toc?.links?.length" :links="page.body?.toc?.links" :class="[open ? 'lg:block' : 'hidden lg:block']" />
          </UPageHeader>

          <UPageBody prose class="pb-0">
            <ContentRenderer v-if="page.body" :value="page" />
            <hr v-if="surround?.length" class="my-8">
            <UContentSurround :surround="surround" />
            <div class="lg:hidden">
              <Ads class="my-5" />
            </div>
          </UPageBody>
        </UPage>
        <Ads v-show="$route.path !== '/'" class="hidden w-[180px] lg:inline-block fixed bottom-5 right-5" />
      </div>
    </UMain>
  </UContainer>
</template>

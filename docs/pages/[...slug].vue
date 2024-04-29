<script setup lang="ts">
import { findPageHeadline, mapContentNavigation, useModuleList } from '#imports'

const route = useRoute()
const segment = computed(() => route.path.split('/')[1])
const navigation = inject('navigation')
const children = computed(() => {
  // first segment
  switch (segment.value) {
    case 'nuxt-seo':
      return navigation.value[0].children
    case 'robots':
      return navigation.value[1].children
    case 'sitemap':
      return navigation.value[2].children
    case 'og-image':
      return navigation.value[3].children
    case 'schema-org':
      return navigation.value[4].children
    case 'link-checker':
      return navigation.value[5].children
    case 'experiments':
      return navigation.value[6].children
    case 'site-config':
      return navigation.value[7].children
    case 'ui':
      return navigation.value[8].children
  }
})
const publicRuntimeConfig = useRuntimeConfig().public

const module = computed(() => {
  const m = useModuleList().find(l => l?.slug === segment.value)
  const stats = (publicRuntimeConfig.moduleStats || []).find(m2 => m2.id === m?.id)?.stats || {}
  if (stats?.downloads) {
    // will look like 395493, we need to make it human readible using native APIs
    // we want to display it like 395k
    m.downloads = Number(stats.downloads).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
  }
  if (stats?.stars)
    m.stars = stats.stars

  return m
})

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
const communityLinks = computed(() => [
  {
    icon: 'i-ph-chat-centered-text-duotone',
    label: 'Discord Support',
    to: 'https://discord.gg/275MBUBvgP',
    target: '_blank',
  },
  {
    icon: 'i-ph-hand-heart-duotone',
    label: 'Become a Sponsor',
    to: 'https://github.com/sponsors/harlan-zw',
    target: '_blank',
  },
])

defineOgImageComponent('Module', {
  title: page.value?.title || '',
  moduleName: module.value?.repo.replace('harlan-zw/', ''),
  description: page.value?.description,
  stars: module.value?.stars,
  downloads: module.value?.downloads,
  version: version.value,
})

const repoLinks = computed(() => [
  {
    icon: 'i-ph-github-logo',
    label: 'Open an issue',
    to: `https://github.com/${module.value?.repo}/issues/new/choose`,
    target: '_blank',
  },
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/harlan-zw/nuxt-seo/edit/v2/docs/content/${page?.value?._file}`,
    target: '_blank',
  },
])

const ecosystemLinks = [
  {
    label: 'Unlighthouse',
    to: 'https://unlighthouse.dev',
    target: '_blank',
  },
  {
    label: 'Unhead',
    to: 'https://unhead.unjs.io',
    target: '_blank',
  },
]
</script>

<template>
  <div>
    <HomePage v-if="page?.home" />
    <UContainer v-else>
      <UMain class="relative">
        <UPage :ui="{ wrapper: 'xl:gap-10' }">
          <template #left>
            <UAside>
              <div v-if="module.slug !== 'nuxt-seo'">
                <div class="flex mb-2 gap-2">
                  <Icon :name="module.icon" class="w-9 h-9 dark:text-blue-400 text-blue-500 group-hover:text-blue-500 transition-all" />
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
                        <Icon name="carbon:chart-line-smooth" class="h-4 w-4 mr-1 opacity-50" />
                        <div>{{ module.downloads }}</div>
                      </div>
                    </a>
                    <a v-if="module.repo !== 'harlan-zw/nuxt-seo'" :href="`http://github.com/${module.repo}`" target="_blank" title="Star on GitHub" class="">
                      <div class="text-sm font-light items-center flex">
                        <Icon name="carbon:star" class="h-4 w-4 mr-1 opacity-50" />
                        {{ module.stars }}
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <UNavigationTree v-if="children" :links="mapContentNavigation(children)" />
            </UAside>
          </template>
          <div>
            <UPage :ui="{ wrapper: 'xl:gap-18' }">
              <UPageHeader :title="page.title" :description="page.description" :links="page.links" :headline="headline">
                <template #headline>
                  <div class="flex items-center">
                    <div class="text-gray-400 flex items-center gap-1">
                      <Icon v-if="module.slug !== 'nuxt-seo'" :name="module.icon" class="w-5 h-5 transition-all" />
                      <div>{{ module.label }}</div>
                    </div>
                    <Icon name="heroicons-solid:chevron-right" class="w-4 h-4 text-gray-400 mx-2" />
                    <div>{{ headline }}</div>
                  </div>
                </template>
              </UPageHeader>

              <UPageBody prose class="pb-0">
                <ContentRenderer v-if="page.body" :value="page" />
                <hr v-if="surround?.length" class="my-8">
                <UDocsSurround :surround="surround" />
              </UPageBody>

              <template #right>
                <UDocsToc :links="page.body?.toc?.links || []">
                  <template #bottom>
                    <div class="hidden lg:block mb-10 mt-10">
                      <Ads class="mb-5" />
                      <UPageLinks v-if="module" :ui="{ container: 'gap-7' }" :links="repoLinks" />
                    </div>
                    <div class="hidden !mt-6 lg:block space-y-6">
                      <UDivider v-if="page.body?.toc?.links?.length" dashed />
                      <UPageLinks title="Community" :links="communityLinks" />
                      <UDivider dashed />
                      <UPageLinks title="Ecosystem" :links="ecosystemLinks" />
                    </div>
                  </template>
                </UDocsToc>
              </template>
            </UPage>
          </div>
        </UPage>
      </UMain>
    </UContainer>
  </div>
</template>

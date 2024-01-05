<script setup lang="ts">
import { findPageHeadline, mapContentNavigation, useModuleList } from '#imports'

const route = useRoute()

const { data: page } = await useAsyncData(`docs-${route.path}`, () => queryContent(route.path).findOne())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { data: surround } = await useAsyncData(`docs-${route.path}-surround`, () => queryContent()
  .only(['_path', 'title', 'navigation', 'description'])
  .where({ _extension: 'md', navigation: { $ne: false } })
  .findSurround(route.path.endsWith('/') ? route.path.slice(0, -1) : route.path))

useSeoMeta({
  title: () => page.value?.title || '',
  description: () => page.value?.description,
})

const navigation = inject('navigation')
const segment = computed(() => route.path.split('/')[1])
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
  const m = useModuleList().find(l => l.slug === segment.value)
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

const version = computed(() => {
  const m = useModuleList().find(l => l.slug === segment.value)
  if (m.slug === 'nuxt-seo')
    return '2'
  const { moduleDeps } = useRuntimeConfig().public
  const key = m?.repo.replace('harlan-zw/', '')
  if (key) {
    const v = moduleDeps[key]?.replace('^', '')
    // we want only the major and minor versions, drop patch
    return v.split('.').slice(0, 2).join('.')
  }
  return ''
})

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
    <UMain class="relative">
      <UPage :ui="{ wrapper: 'xl:gap-10' }">
        <template #left>
          <UAside>
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
                    <Logo v-else />
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
                <template #top>
                  <div class="hidden lg:block">
                    <UPageLinks v-if="module" :ui="{ container: 'gap-7' }" :title="module.fullLabel ? module.fullLabel : `Nuxt ${module.label}`" :links="repoLinks">
                      <template #title>
                        <div class="w-full hidden lg:block">
                          <div class="flex justify-center items-center mb-2 gap-3">
                            <Icon v-if="module.slug !== 'nuxt-seo'" :name="module.icon" class="w-8 h-8 dark:text-blue-500/75 text-blue-500 group-hover:text-blue-500 transition-all" />
                            <Logo v-else />
                            <div class="flex gap-2">
                              <a :href="`https://github.com/${module.repo}`" target="_blank" title="GitHub Repo"><Icon class="w-5 h-5" name="logos:github-icon" /></a>
                              <a :href="`https://www.npmjs.com/package/nuxt-${module.id}`" target="_blank" title="NPM"><Icon class="w-5 h-5" name="logos:npm-icon" /></a>
                            </div>
                          </div>
                          <div class="flex items-center mb-3 space-x-3">
                            <div class="text-sm font-normal font-mono items-center flex space-x-2 dark:bg-blue-900/50 bg-blue-50/50 w-full px-3 py-2 rounded">
                              <div class="text-xs text-center text-gray-600 dark:text-gray-300 w-full">
                                <template v-if="module.slug !== 'nuxt-seo'">
                                  {{ module.repo.replace('harlan-zw/', '') }}
                                </template>
                                <template v-else>
                                  @nuxt/seo
                                </template>
                              </div>
                            </div>
                          </div>
                          <div class="hidden lg:block dark:text-gray-400 text-gray-600 mb-2">
                            <div v-if="module.downloads && module.stars">
                              <div class="text-xs space-y-3">
                                <a :href="`http://npmjs.com/${module.repo.replace('harlan-zw/', '')}`" target="_blank" title="View on NPM" class="flex justify-between text-right">
                                  <div class="mb-1 text-xl font-light items-center flex">
                                    <Icon name="carbon:version-minor" class="h-5 w-5 mr-1 opacity-90" />
                                    <div>v{{ version }}</div>
                                  </div>
                                  <div class="flex items-center font-normal opacity-70 text-[11px] leading-[12px]">Latest<br> minor version</div>
                                </a>
                                <a :href="`http://npmjs.com/${module.repo.replace('harlan-zw/', '')}`" target="_blank" title="View on NPM" class="flex justify-between text-right">
                                  <div class="mb-1 text-xl font-light items-center flex">
                                    <Icon name="carbon:chart-line-smooth" class="h-5 w-5 mr-1 opacity-90" />
                                    <div>{{ module.downloads }}</div>
                                  </div>
                                  <div class="flex items-center font-normal opacity-70 text-[11px] leading-[12px]">Downloads<br>/ month</div>
                                </a>
                                <a :href="`http://github.com/${module.repo}`" target="_blank" title="Star on GitHub" class="flex justify-between">
                                  <div class="mb-1 text-xl font-light items-center flex">
                                    <Icon name="carbon:star" class="h-5 w-5 mr-1 opacity-90" />
                                    {{ module.stars }}
                                  </div>
                                  <div class="flex items-center font-normal text-right opacity-70  text-[11px] leading-[12px]">Stars</div>
                                </a>
                              </div>
                            </div>
                          </div>
                          <UDivider dashed class="my-3" />
                          <button class="flex items-center gap-1.5 lg:cursor-text lg:select-text w-full" tabindex="-1">
                            <span class="font-semibold text-sm/6 truncate">Useful Links</span>
                            <span class="i-heroicons-chevron-down-20-solid lg:!hidden w-5 h-5 ms-auto transform transition-transform duration-200 flex-shrink-0 mr-1.5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 -rotate-90" />
                          </button>
                        </div>
                      </template>
                    </UPageLinks>
                    <UDivider dashed />
                  </div>
                </template>
                <template #bottom>
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
  </div>
</template>

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

defineOgImage()

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

const publicRuntimeConfig = useRuntimeConfig().public
const module = computed(() => {
  const m = useModuleList().find(l => l.slug === segment.value)
  const stats = (publicRuntimeConfig.moduleStats || []).find(m2 => m2.id === m?.id)?.stats || {}
  if (stats.downloads) {
    // will look like 395493, we need to make it human readible using native APIs
    // we want to display it like 395k
    m.downloads = Number(stats.downloads).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
  }
  if (stats.stars)
    m.stars = stats.stars

  return m
})

const repoLinks = computed(() => [
  {
    icon: 'i-ph-github-logo',
    label: 'Open in GitHub',
    to: `https://github.com/harlan-zw/${module.value?.repo}`,
    target: '_blank',
  },
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/harlan-zw/nuxt-seo-kit/edit/v2/docs/content/${page?.value?._file}`,
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
            <UPageHeader :title="page.title" :description="page.description" :links="page.links" :headline="headline" />

            <UPageBody prose class="pb-0">
              <ContentRenderer v-if="page.body" :value="page" />
              <hr v-if="surround?.length" class="my-8">
              <UDocsSurround :surround="surround" />
            </UPageBody>

            <template #right>
              <UDocsToc :links="page.body?.toc?.links || []">
                <template #top>
                  <div class="hidden lg:block">
                    <a v-if="module" target="_blank" :href="`https://github.com/${module.repo}`" class="block group mb-2 pb-1 text-sm">
                      <div>
                        <div class="flex items-center space-x-1">
                          <Icon v-if="module" :name="module.icon" class="w-6 h-6 dark:text-blue-900 text-blue-300 group-hover:text-blue-500 transition-all" />
                          <div class="">
                            <div>{{ module.label }}</div>
                          </div>
                        </div>
                      </div>
                    </a>
                    <div v-if="module.downloads && module.stars">
                      <div class="mb-7">
                        <div class="text-xs flex space-x-5">
                          <div>
                            <div class="opacity-70 mb-1">
                              Downloads
                            </div>
                            <div class="flex items-center">
                              <Icon name="carbon:chart-line-smooth" class="h-4 w-4 mr-1 opacity-50" />{{ module.downloads }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs opacity-70 mb-1">
                              Stars
                            </div>
                            <div class="flex items-center">
                              <Icon name="carbon:star" class="h-4 w-4 mr-1 opacity-50" />
                              {{ module.stars }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <UDivider dashed />
                  <UPageLinks :title="module.fullLabel ? module.fullLabel : `Nuxt ${module.label}`" :links="repoLinks" />
                  <UDivider dashed />
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

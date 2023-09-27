<script setup lang="ts">
import { findPageHeadline, mapContentNavigation } from '#imports'

const route = useRoute()

const { data: page } = await useAsyncData(`docs-${route.path}`, () => queryContent(route.path).findOne())
if (!page.value)
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })

const { data: surround } = await useAsyncData(`docs-${route.path}-surround`, () => queryContent()
  .only(['_path', 'title', 'navigation', 'description'])
  .where({ _extension: 'md', navigation: { $ne: false } })
  .findSurround(route.path.endsWith('/') ? route.path.slice(0, -1) : route.path))

const [prev, next] = surround.value

useSeoMeta({
  title: () => page.value?.title,
  description: () => page.value?.description,
})

defineOgImage()

const navigation = inject('navigation')
const children = computed(() => {
  // first segment
  const segment = route.path.split('/')[1]
  switch (segment) {
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
  }
})

const headline = computed(() => findPageHeadline(page.value))
const communityLinks = computed(() => [
  {
    icon: 'i-ph-pen-duotone',
    label: 'Edit this page',
    to: `https://github.com/harlan-zw/nuxt-seo-kit/edit/v2/docs/content/${page?.value?._file}`,
    target: '_blank',
  },
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
    <UMain>
      <UPage :ui="{ wrapper: 'xl:gap-10' }">
        <template #left>
          <UAside>
            <UNavigationTree :links="mapContentNavigation(children)" />
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

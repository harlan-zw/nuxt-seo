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

defineOgImageComponent(page.value.ogImageComponent || 'NuxtSeo', {
  title: page.value?.title || '',
  description: page.value?.description,
})

// Technical SEO for an blog article
const articlePublishedTime = `${page.value.publishedAt}T12:00:00Z`
const articleModifiedTime = `${page.value.updatedAt}T12:00:00Z`

const humanPublishedDate = new Date(page.value.publishedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const humanUpdatedDate = new Date(page.value.updatedAt).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

useSeoMeta({
  ogType: 'article',
  author: 'Harlan Wilton',
  articleAuthor: ['Harlan Wilton'],
  articleSection: 'SEO Tutorials for Vue and Nuxt',
  articleTag: page.value.keywords,
  articlePublishedTime,
  articleModifiedTime,
  twitterData1: 'Harlan Wilton',
  twitterLabel1: 'Author',
  twitterData2: page.value.readTime,
  twitterLabel2: 'Read Time',
})

useSchemaOrg([
  definePerson({
    '@id': '#author',
    'name': 'Harlan Wilton',
    'description': 'An open-source developer from  Sydney, Australia. Core team member of  Nuxt,  VueUse and  UnJS. Author of Unlighthouse, Unhead and Nuxt SEO.',
    'sameAs': [
      'https://twitter.com/harlan_zw',
      'https://github.com/harlan-zw',
    ],
    'url': 'https://harlanzw.com',
  }),
  defineArticle({
    author: { '@id': '#author' },
    keywords: page.value.keywords,
    datePublished: articlePublishedTime,
    dateModified: articleModifiedTime,
    articleSection: ['SEO Tutorials for Vue and Nuxt'],
  }),
])

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
      <div class="flex justify-center gap-5 mt-5">
        <div class="flex items-center gap-2 text-gray-300">
          <NuxtLink to="https://x.com/harlan_zw" class="hover:underline inline-flex items-center gap-2">
            <img alt="Harlan Wilton" src="https://avatars.githubusercontent.com/u/5326365?v=4" class="w-6 h-6 rounded-full">
            Harlan Wilton
          </NuxtLink>
        </div>
        <span v-if="page.readTime" class="font-semibold text-gray-500">{{ page.readTime }} read</span>
      </div>
      <div class="mt-5">
        <TableOfContents v-if="page.body?.toc?.links?.length" :links="page.body?.toc?.links" class="mt-7" />
      </div>
    </UPageHeader>

    <UPageBody prose class="pb-0">
      <div>
        <div class="flex justify-between">
          <div v-if="page.updatedAt" class="text-gray-500">
            Last Updated
            <time :datetime="page.updatedAt">{{ humanUpdatedDate }}</time>
          </div>
          <div v-if="page.publishedAt" class="text-gray-500">
            Published
            <time :datetime="page.publishedAt">{{ humanPublishedDate }}</time>
          </div>
        </div>
      </div>
      <Ads />
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

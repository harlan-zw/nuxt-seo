<script lang="ts" setup>
const config = useRuntimeConfig().public
const router = useRouter()
const nuxtApp = useNuxtApp()

const route = router.currentRoute

const resolveUrl = createInternalLinkResolver()

const computeMeta = () => {
  const meta = []
  if (route.value.meta?.description) {
    meta.push({
      name: 'description',
      content: route.value.meta?.description,
    })
  }
  if (route.value.meta?.image) {
    meta.push({
      property: 'og:image',
      content: () => route.value.meta?.image || null,
    })
  }
  return meta
}

useHead({
  title: () => route.value.meta?.title || null,
  titleTemplate: title => title ? `${title} - ${config.siteTitle}` : config.siteTitle,
  meta: computeMeta,
})

useSeoMeta({
  ogUrl: () => resolveUrl(route.value.path),
  ogLocale: () => config.language,
  ogSiteName: () => config.siteTitle,
  ogType: 'website',
})

useServerHead({
  meta: [
    {
      name: 'robots',
      content: () => {
        if (config.indexable === false)
          return 'noindex, nofollow'

        // SSR only
        const { routeRules } = nuxtApp.ssrContext?.event?.context?._nitro
        if (routeRules.index === false)
          return 'noindex, nofollow'

        return 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      },
    },
  ],
})

useHead({
  htmlAttrs: {
    lang: () => config.language,
  },
  link: [
    {
      rel: 'profile',
      href: 'https://gmpg.org/xfn/11',
    },
    {
      rel: 'canonical',
      href: () => resolveUrl(`${route.value.path}`),
    },
  ],
})

useSchemaOrg([
  defineWebSite({
    name: config.siteTitle,
    inLanguage: config.language,
    description: config.siteDscription,
  }),
  defineWebPage(),
])
</script>

<template>
  <div />
</template>

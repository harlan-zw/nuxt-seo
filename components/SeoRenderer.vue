<script lang="ts" setup>
import { useSeoMeta, useServerHead } from '@vueuse/head'
import { withTrailingSlash } from 'ufo'

const config = useAppConfig()
const router = useRouter()

const route = router.currentRoute

const ensureSlash = (x: string) => config.trailingSlashes ? withTrailingSlash(x) : x

useHead({
  title: () => route.value.meta?.title || null,
  titleTemplate: (title) => title ? `${title} - ${config.siteTitle}` : config.siteTitle,
  meta: [
    {
      name: 'description',
      content: () => route.value.meta?.description || null,
    },
    {
      name: 'og:image',
      content: () => route.value.meta?.image || null,
    }
  ]
})

useSeoMeta({
  ogUrl: () => ensureSlash(`${config.url}${route.value.path}`),
  ogLocale: () => config.locale,
  ogSiteName: () => config.siteTitle,
  ogType: 'website',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
})

useServerHead({
  htmlAttrs: {
    lang: () => config.locale,
  },
  link: [
    {
      rel: 'profile',
      href: 'https://gmpg.org/xfn/11',
    },
    {
      rel: 'canonical',
      href: () => ensureSlash(`${config.url}${route.value.path}`),
    }
  ]
})
</script>
<template>
  <div>
    <slot />
  </div>
</template>

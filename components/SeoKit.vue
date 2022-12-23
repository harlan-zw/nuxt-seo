<script lang="ts" setup>
import config from '#nuxt-seo-kit/config'
const appConfig = useAppConfig()

const siteMeta = computed(() => {
  const moduleConfig = {}
  const map = ['siteName', 'siteDescription', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language']

  for (const k of map) {
    if (config[k])
      moduleConfig[k] = config[k]
  }
  return {
    ...moduleConfig,
    // app config has the highest priority
    ...appConfig.site,
  }
})

const router = useRouter()
const route = router.currentRoute

const resolveUrl = createInternalLinkResolver()

useHead({
  title: () => {
    if (route.value?.meta?.title)
      return route.value?.meta?.title

    // if no title has been set then we should use the last segment of the URL path and title case it
    const path = route.value?.path || '/'
    const lastSegment = path.split('/').pop()
    return lastSegment ? titleCase(lastSegment) : ''
  },
  titleTemplate: title => title ? `${title} ${siteMeta.value.titleSeparator} ${siteMeta.value.siteName}` : siteMeta.value.siteName,
})

useServerHead({
  htmlAttrs: {
    lang: () => siteMeta.value.language,
  },
  link: [
    {
      rel: 'profile',
      href: 'https://gmpg.org/xfn/11',
    },
    {
      rel: 'canonical',
      href: () => resolveUrl(route.value?.path || '/'),
    },
  ],
})

useSeoMeta({
  description: () => {
    return route.value?.meta?.description || siteMeta.value.siteDescription || undefined
  },
  ogUrl: () => resolveUrl(route.value?.path || '/'),
  ogLocale: () => siteMeta.value.language,
  ogSiteName: () => siteMeta.value.siteName,
  ogImage: () => {
    return route.value?.meta?.image || siteMeta.value.image || undefined
  },
  ogType: 'website',
})

defineRobotMeta()

useSchemaOrg([
  defineWebSite({
    name: () => siteMeta.value.siteName,
    inLanguage: () => siteMeta.value.language,
    description: () => siteMeta.value.siteDescription,
  }),
  defineWebPage(),
])
</script>

<template>
<div />
</template>

<script lang="ts" setup>
import config from '#nuxt-seo-kit/config'
const appConfig = useAppConfig()

const siteMeta = computed(() => {
  const moduleConfig = {}
  const map = ['siteName', 'siteDescription', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language']

  for (const k of map) {
    // @ts-expect-error untyped
    if (config[k])
      // @ts-expect-error untyped
      moduleConfig[k] = config[k]
  }
  return {
    ...moduleConfig,
    // app config has the highest priority
    // @ts-expect-error untyped
    ...appConfig.site,
  }
})

const router = useRouter()
const route = router.currentRoute

const resolveUrl = createInternalLinkResolver()

useHead({
  htmlAttrs: {
    lang: () => siteMeta.value.language,
  },
  title: (): string => {
    if (typeof route.value?.meta?.title === 'string')
      return route.value?.meta?.title

    // if no title has been set then we should use the last segment of the URL path and title case it
    const path = route.value?.path || '/'
    const lastSegment = path.split('/').pop()
    return lastSegment ? titleCase(lastSegment) : ''
  },
  titleTemplate: title => title ? `${title} ${siteMeta.value.titleSeparator} ${siteMeta.value.siteName}` : siteMeta.value.siteName,
  link: [
    {
      rel: 'canonical',
      href: () => resolveUrl(route.value?.path || '/'),
    },
  ],
})

useServerHead({
  link: [
    {
      rel: 'profile',
      href: 'https://gmpg.org/xfn/11',
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

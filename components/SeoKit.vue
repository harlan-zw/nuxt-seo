<script lang="ts" setup>
import config from '#nuxt-seo-kit/config'
const appConfig = useAppConfig()

const siteMeta = computed(() => {
  const moduleConfig = {}
  const map = ['siteName', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language']

  for (const k of map) {
    if (config[k])
      moduleConfig[k] = config[k]
  }
  return {
    titleSeparator: ' | ',
    language: 'en',
    ...moduleConfig,
    ...appConfig.docus, // fallback to docus app config
    // site has the highest priority
    ...appConfig.site,
  }
})

const router = useRouter()
const route = router.currentRoute

const resolveUrl = createInternalLinkResolver()

const computeMeta = () => {
  const meta = []
  if (route.value.meta?.description || siteMeta.value.description) {
    meta.push({
      name: 'description',
      content: route.value.meta?.description || siteMeta.value.description,
    })
  }
  if (route.value.meta?.image || siteMeta.value.image) {
    meta.push({
      property: 'og:image',
      content: () => route.value.meta?.image || siteMeta.value.image || null,
    })
  }
  return meta
}

useHead({
  title: () => {
    if (route.value.meta?.title)
      return route.value.meta?.title

    // if no title has been set then we should use the last segment of the URL path and title case it
    const path = route.value.path
    const lastSegment = path.split('/').pop()
    return lastSegment ? titleCase(lastSegment) : ''
  },
  titleTemplate: title => title ? `${title} ${siteMeta.value.titleSeparator} ${siteMeta.value.siteName}` : siteMeta.value.siteName,
  meta: () => computeMeta(),
})

useSeoMeta({
  ogUrl: () => resolveUrl(route.value.path),
  ogLocale: () => siteMeta.value.language,
  ogSiteName: () => siteMeta.value.siteName,
  ogType: 'website',
})

defineRobotMeta()

useHead({
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
      href: () => resolveUrl(`${route.value.path}`),
    },
  ],
})

useSchemaOrg([
  defineWebSite({
    name: () => siteMeta.value.siteName,
    inLanguage: () => siteMeta.value.language,
    description: () => siteMeta.value.description,
  }),
  defineWebPage(),
])
</script>

<template>
  <div />
</template>

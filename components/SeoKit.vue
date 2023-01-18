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

function computeMeta() {
  return [
    {
      name: 'description',
      content: route.value?.meta?.description || siteMeta.value.siteDescription || undefined,
    },
    {
      property: 'og:url',
      content: resolveUrl(route.value?.path || '/'),
    },
    {
      property: 'og:locale',
      content: siteMeta.value.language,
    },
    {
      property: 'og:site_name',
      content: siteMeta.value.siteName,
    },
    {
      property: 'og:image',
      content: route.value?.meta?.image || siteMeta.value.image || null,
    },
    {
      property: 'og:type',
      content: 'website',
    },
  ].filter(meta => !!meta.content)
}

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
  meta: computeMeta,
})

useServerHead({
  link: [
    {
      rel: 'profile',
      href: 'https://gmpg.org/xfn/11',
    },
  ],
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

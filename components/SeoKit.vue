<script lang="ts" setup>
const config = useRuntimeConfig().public
const router = useRouter()

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
  title: () => {
    if (route.value.meta?.title) {
      return route.value.meta?.title
    }
    // if no title has been set then we should use the last segment of the URL path and title case it
    const path = route.value.path
    const lastSegment = path.split('/').pop()
    return lastSegment ? titleCase(lastSegment) : ''
  },
  titleTemplate: title => title ? `${title} - ${config.siteTitle}` : config.siteTitle,
  meta: computeMeta,
})

useSeoMeta({
  ogUrl: () => resolveUrl(route.value.path),
  ogLocale: () => config.language,
  ogSiteName: () => config.siteTitle,
  ogType: 'website',
})

defineRobotMeta()

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

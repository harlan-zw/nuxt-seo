<script lang="ts" setup>
import type { MetaObject } from '@nuxt/schema'
import { computed } from 'vue'
import { resolveAbsoluteInternalLink } from '../composables/internalLinks'
import { useAppConfig, useRuntimeConfig } from '#app'
import * as config from '#nuxt-seo-kit/config'

const runtimeConfig = useRuntimeConfig().public
const appConfig = useAppConfig()

const SeoKitPublicRuntimeConfigKeys = [
  'siteName',
  'siteDescription',
  'siteImage',
  'siteUrl',
  'titleSeparator',
  'trailingSlash',
  'language',
] as const

interface SeoKitOptions {
  siteUrl: string
  siteName: string
  siteDescription: string
  siteImage: string
  indexable: boolean
  titleSeparator: string
  trailingSlash: boolean
  language: string
}

const siteMeta = computed<SeoKitOptions>(() => {
  const runtimeConfigExtract = {}

  for (const k of SeoKitPublicRuntimeConfigKeys) {
    if (runtimeConfig[k])
      // @ts-expect-error untyped
      runtimeConfigExtract[k] = runtimeConfig[k]
  }
  return {
    ...config,
    ...runtimeConfigExtract,
    // app config has the highest priority
    // @ts-expect-error untyped
    ...appConfig.site,
  }
})

const router = useRouter()
const route = router.currentRoute
const resolveUrl = createInternalLinkResolver()

function computeMeta() {
  const meta: MetaObject['meta'] = [
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
  ]
  let ogImage = route.value?.meta?.image || siteMeta.value.siteImage
  if (typeof ogImage === 'string') {
    if (ogImage.startsWith('/'))
      ogImage = resolveAbsoluteInternalLink(ogImage)
    meta.push({
      property: 'og:image',
      content: ogImage as string,
    })
  }
  const description = route.value?.meta?.description || siteMeta.value.siteDescription
  if (description) {
    meta.push({
      name: 'description',
      content: description as string,
    })
  }
  return meta
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
  meta: [
    {
      property: 'og:type',
      content: 'website',
    },
  ],
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

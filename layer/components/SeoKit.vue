<script lang="ts" setup>
import type { MetaObject } from '@nuxt/schema'
import { computed } from 'vue'
import { createInternalLinkResolver, resolveAbsoluteInternalLink } from '../composables/internalLinks'
import { titleCase } from '../composables/casing'
import { defineRobotMeta, defineWebPage, defineWebSite, useAppConfig, useHead, useRouter, useRuntimeConfig, useSchemaOrg, useServerHead } from '#imports'

interface SeoKitOptions {
  siteUrl?: string
  siteName?: string
  siteDescription?: string
  siteImage?: string
  indexable?: boolean
  titleSeparator?: string
  trailingSlash?: boolean
  language?: string
}

const props = defineProps<{
  siteUrl?: string
  siteName?: string
  siteDescription?: string
  siteImage?: string
  titleSeparator?: string
  language?: string
}>()

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

const siteMeta = computed<SeoKitOptions>(() => {
  const runtimeConfigExtract = {}
  for (const k of SeoKitPublicRuntimeConfigKeys) {
    if (runtimeConfig[k])
      // @ts-expect-error untyped
      runtimeConfigExtract[k] = runtimeConfig[k]
  }
  const propExtract = {}
  for (const k of SeoKitPublicRuntimeConfigKeys) {
    // @ts-expect-error untyped
    if (props[k])
      // @ts-expect-error untyped
      propExtract[k] = props[k]
  }
  return {
    ...runtimeConfigExtract,
    // app config has the highest priority
    // @ts-expect-error untyped
    ...appConfig.site,
    ...propExtract,
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
  ]
  if (siteMeta.value.siteName) {
    meta.push({
      property: 'og:site_name',
      content: siteMeta.value.siteName,
    })
  }
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
  templateParams: {
    // @ts-expect-error untyped
    siteName: () => siteMeta.value.siteName,
    // @ts-expect-error untyped
    siteDescription: () => siteMeta.value.siteDescription,
    // @ts-expect-error untyped
    siteImage: () => siteMeta.value.siteImage,
    // @ts-expect-error untyped
    siteUrl: () => siteMeta.value.siteUrl,
    // @ts-expect-error untyped
    titleSeparator: () => siteMeta.value.titleSeparator,
    // @ts-expect-error untyped
    trailingSlash: () => siteMeta.value.trailingSlash,
    // @ts-expect-error untyped
    language: () => siteMeta.value.language,
  },
  htmlAttrs: {
    lang: () => siteMeta.value.language,
  },
  title: () => {
    if (typeof route.value?.meta?.title === 'string')
      return route.value?.meta?.title

    // if no title has been set then we should use the last segment of the URL path and title case it
    const path = route.value?.path || '/'
    const lastSegment = path.split('/').pop()
    return lastSegment ? titleCase(lastSegment) : null
  },
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
    name: () => siteMeta.value?.siteName || '',
    inLanguage: () => siteMeta.value?.language || '',
    description: () => siteMeta.value?.siteDescription || '',
  }),
  defineWebPage(),
])
</script>

<template>
  <div />
</template>

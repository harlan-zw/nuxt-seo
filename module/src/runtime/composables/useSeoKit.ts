import type { MetaObject } from '@nuxt/schema'
import {
  createSitePathResolver, defineRobotMeta, defineWebPage, defineWebSite,
  useHead,
  useRouter, useSchemaOrg,
  useSiteConfig,
} from '#imports'

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export function useSeoKit() {
  const siteConfig = useSiteConfig()

  const router = useRouter()
  const route = router.currentRoute
  const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })

  function computeMeta() {
    const meta: MetaObject['meta'] = [
      {
        property: 'og:url',
        content: resolveUrl(route.value?.path || '/'),
      },
      {
        property: 'og:locale',
        content: siteConfig.language,
      },
    ]
    if (siteConfig.name) {
      meta.push({
        property: 'og:site_name',
        content: siteConfig.name,
      })
    }
    let ogImage = route.value?.meta?.image || siteConfig.image
    if (typeof ogImage === 'string') {
      if (ogImage.startsWith('/'))
        ogImage = resolveUrl(ogImage)
      meta.push({
        property: 'og:image',
        content: ogImage as string,
      })
    }
    const description = route.value?.meta?.description || siteConfig.description
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
      site: siteConfig,
    },
    htmlAttrs: {
      lang: () => siteConfig.locale,
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

  defineRobotMeta()

  useSchemaOrg([
    defineWebSite({
      name: () => siteConfig?.name || '',
      inLanguage: () => siteConfig?.locale || '',
      description: () => siteConfig?.description || '',
    }),
    defineWebPage(),
  ])
}

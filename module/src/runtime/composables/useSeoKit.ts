import type { MetaObject } from '@nuxt/schema'
import { defu } from 'defu'
import type { SiteConfigInput } from 'nuxt-site-config-kit'
import {
  computed, createSitePathResolver, defineRobotMeta, defineWebPage,
  defineWebSite, useHead,
  useRoute,
  useSchemaOrg,
  useSiteConfig,
} from '#imports'

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export function useSeoKit(_siteConfig: SiteConfigInput) {
  const siteConfig = defu(_siteConfig, useSiteConfig())
  delete siteConfig._context

  const route = useRoute()
  const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })

  function computeMeta() {
    const meta: MetaObject['meta'] = [
      {
        property: 'og:url',
        content: resolveUrl(route.path || '/'),
      },
      {
        property: 'og:locale',
        content: siteConfig.defaultLocale,
      },
    ]
    if (siteConfig.name) {
      meta.push({
        property: 'og:site_name',
        content: siteConfig.name,
      })
    }
    let ogImage = route.meta?.image || siteConfig.image
    if (typeof ogImage === 'string') {
      if (ogImage.startsWith('/'))
        ogImage = resolveUrl(ogImage)
      meta.push({
        property: 'og:image',
        content: ogImage as string,
      })
    }
    const description = route.meta?.description || siteConfig.description
    if (description) {
      meta.push({
        name: 'description',
        content: description as string,
      })
    }
    return meta
  }

  const canonicalUrl = computed(() => resolveUrl(route.path || '/').value)

  useHead({
    templateParams: {
      site: { ...siteConfig },
    },
    htmlAttrs: {
      lang: () => siteConfig.locale,
    },
    title: () => {
      if (typeof route.meta?.title === 'string')
        return route.meta?.title

      // if no title has been set then we should use the last segment of the URL path and title case it
      const path = route.path || '/'
      const lastSegment = path.split('/').pop()
      return lastSegment ? titleCase(lastSegment) : null
    },
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl,
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

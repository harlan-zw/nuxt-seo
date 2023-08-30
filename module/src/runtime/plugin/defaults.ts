import type { SiteConfig } from 'nuxt-site-config-kit'
import { defineNuxtPlugin } from 'nuxt/app'
import {
  computed,
  createSitePathResolver,
  defineOgImage,
  defineRobotMeta,
  defineWebPage,
  defineWebSite, useHead,
  useRoute,
  useSchemaOrg,
  useSeoMeta,
  useServerHead,
  useSiteConfig,
} from '#imports'

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export default defineNuxtPlugin({
  name: 'nuxtseo:defaults',
  setup(nuxtApp) {
    // get the head instance
    const siteConfig = useSiteConfig() as SiteConfig
    delete siteConfig._context

    nuxtApp.vueApp.runWithContext(() => {
      const route = useRoute()
      const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })
      const canonicalUrl = computed(() => resolveUrl(route.path || '/').value)

      const title = computed(() => {
        if (typeof route.meta?.title === 'string')
          return route.meta?.title

        // if no title has been set then we should use the last segment of the URL path and title case it
        const path = route.path || '/'
        const lastSegment = path.split('/').pop()
        return lastSegment ? titleCase(lastSegment) : null
      })

      useHead({
        title,
        link: [{ rel: 'canonical', href: canonicalUrl }],
      })

      useServerHead({
        templateParams: { site: () => siteConfig, separator: siteConfig.titleSeparator },
        // TODO integrate with nuxt/i18n
        htmlAttrs: { lang: () => siteConfig.deaultLocale },
        titleTemplate: '%s %separator %site.name',
      })

      useSeoMeta({
        ogUrl: canonicalUrl,
        // TODO integrate with nuxt/i18n
        ogLocale: siteConfig.defaultLocale,
        ogSiteName: siteConfig.name,
        description: siteConfig.description,
        // extra og are set by InferSeoMeta plugin
      })

      // init vendors
      defineOgImage()
      defineRobotMeta()
      useSchemaOrg([
        defineWebSite({
          name: () => siteConfig?.name || '',
          // TODO integrate with nuxt/i18n
          inLanguage: () => siteConfig?.defaultLocale || '',
          description: () => siteConfig?.description || '',
        }),
        defineWebPage(),
      ])
    })
  },
})

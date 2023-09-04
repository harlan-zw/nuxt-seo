import type { SiteConfig } from 'nuxt-site-config-kit'
import { defineNuxtPlugin } from 'nuxt/app'
import {
  computed,
  createSitePathResolver,
  defineOgImage,
  defineRobotMeta,
  defineWebPage,
  defineWebSite,
  useHead,
  useRoute,
  useSchemaOrg,
  useSeoMeta,
  useServerHead,
  useSiteConfig,
} from '#imports'

export default defineNuxtPlugin({
  name: 'nuxtseo:defaults',
  setup() {
    // get the head instance
    const siteConfig = { ...useSiteConfig() } as Omit<SiteConfig, '_context'>
    delete siteConfig._context
    const route = useRoute()
    const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })
    const canonicalUrl = computed(() => resolveUrl(route.path || '/').value)

    useHead({
      link: [{ rel: 'canonical', href: canonicalUrl }],
    })

    useServerHead({
      templateParams: { site: siteConfig, separator: siteConfig.titleSeparator },
      // TODO integrate with nuxt/i18n
      htmlAttrs: { lang: siteConfig.deaultLocale },
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
  },
})

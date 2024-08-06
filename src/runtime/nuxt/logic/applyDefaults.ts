import type { UseHeadOptions, UseSeoMetaInput } from '@unhead/vue'
import type { QueryObject } from 'ufo'
import { stringifyQuery } from 'ufo'
import {
  computed,
  createSitePathResolver,
  useHead,
  useRoute,
  useRuntimeConfig,
  useSeoMeta,
  useServerHead,
  useSiteConfig,
} from '#imports'

export function applyDefaults() {
  // get the head instance
  const { canonicalQueryWhitelist } = useRuntimeConfig().public['nuxt-seo']
  const siteConfig = useSiteConfig()
  const route = useRoute()
  const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })
  const canonicalUrl = computed<string>(() => {
    const { query } = route
    const url = resolveUrl(route.path || '/').value || route.path
    // apply canonicalQueryWhitelist to query
    const filteredQuery = Object.fromEntries(
      Object.entries(query).filter(([key]) => canonicalQueryWhitelist.includes(key)),
    ) as QueryObject
    return Object.keys(filteredQuery).length
      ? `${url}?${stringifyQuery(filteredQuery)}`
      : url
  })

  const minimalPriority: UseHeadOptions = {
    // give nuxt.config values higher priority
    tagPriority: 101,
  }

  // needs higher priority
  useHead({
    link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
  }, minimalPriority)
  const locale = siteConfig.currentLocale || siteConfig.defaultLocale
  if (locale) {
    useServerHead({
      htmlAttrs: { lang: locale },
    })
  }

  // TODO support SPA
  useHead({
    templateParams: { site: siteConfig, siteName: siteConfig.name || '' },
    titleTemplate: '%s %separator %siteName',
  }, minimalPriority)

  const seoMeta: UseSeoMetaInput = {
    ogType: 'website',
    ogUrl: () => canonicalUrl.value,
    ogLocale: locale,
    ogSiteName: siteConfig.name,
  }
  if (siteConfig.description)
    seoMeta.description = siteConfig.description
  if (siteConfig.twitter) {
    // id must have the @ in it
    const id = siteConfig.twitter.startsWith('@')
      ? siteConfig.twitter
      : `@${siteConfig.twitter}`
    seoMeta.twitterCreator = id
    seoMeta.twitterSite = id
  }
  // TODO server only for some tags
  useSeoMeta(seoMeta, minimalPriority)
}

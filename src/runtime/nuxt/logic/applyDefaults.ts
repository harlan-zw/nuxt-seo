import type { UseHeadOptions, UseSeoMetaInput } from '@unhead/vue'
import {
  computed,
  createSitePathResolver,
  useHead,
  useRoute,
  useSeoMeta,
  useServerHead,
  useSiteConfig,
} from '#imports'

export function applyDefaults() {
  // get the head instance
  const siteConfig = useSiteConfig()
  const route = useRoute()
  const resolveUrl = createSitePathResolver({ withBase: true, absolute: true })
  const canonicalUrl = computed<string>(() => resolveUrl(route.path || '/').value || route.path)

  const minimalPriority: UseHeadOptions = {
    // give nuxt.config values higher priority
    tagPriority: 101,
  }

  // needs higher priority
  useHead({
    link: [{ rel: 'canonical', href: () => canonicalUrl.value }],
  })
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

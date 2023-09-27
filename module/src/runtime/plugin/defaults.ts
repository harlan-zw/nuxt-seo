import type { SiteConfig } from 'nuxt-site-config-kit'
import { defineNuxtPlugin } from 'nuxt/app'
import type { UseHeadOptions, UseSeoMetaInput } from '@unhead/vue'
import type { Organization, Person } from '@unhead/schema-org'
import {
  computed,
  createSitePathResolver,
  defineOrganization,
  definePerson,
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

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export default defineNuxtPlugin({
  name: 'nuxtseo:defaults',
  setup() {
    // get the head instance
    const siteConfig = { ...useSiteConfig() } as Omit<SiteConfig, '_context'>
    delete siteConfig._context
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

    const minimalPriority: UseHeadOptions = {
      // give nuxt.config values higher priority
      tagPriority: 101,
    }

    useHead({
      // fallback title
      title,
    }, minimalPriority)

    // needs higher priority
    useHead({
      link: [{ rel: 'canonical', href: canonicalUrl }],
    })
    const locale = siteConfig.currentLocale || siteConfig.defaultLocale
    if (locale) {
      useServerHead({
        htmlAttrs: { lang: locale },
      })
    }

    // TODO support SPA
    useHead({
      templateParams: { site: siteConfig, siteName: siteConfig.name },
      titleTemplate: '%s %separator %site.name',
    }, minimalPriority)

    const seoMeta: UseSeoMetaInput = {
      ogUrl: canonicalUrl,
      ogLocale: siteConfig.defaultLocale,
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
    useSeoMeta(seoMeta, minimalPriority)

    // init vendors
    defineRobotMeta()
    useSchemaOrg([
      defineWebSite({
        name: () => siteConfig?.name || '',
        // TODO integrate with nuxt/i18n
        inLanguage: () => siteConfig?.currentLocale || '',
        description: () => siteConfig?.description || '',
      }),
      defineWebPage(),
    ])
    if (siteConfig.identity) {
      const identityPayload: Person | Organization = {
        name: siteConfig.identity.name || siteConfig.name,
        url: siteConfig.url,
      }
      if (siteConfig.twitter) {
        // without the @
        const id = siteConfig.twitter.startsWith('@')
          ? siteConfig.twitter.slice(1)
          : siteConfig.twitter
        identityPayload.sameAs = [
          `https://twitter.com/${id}`,
        ]
      }
      useSchemaOrg([
        siteConfig.identity.type === 'Person'
          ? definePerson(identityPayload)
          : defineOrganization(identityPayload),
      ])
    }
  },
})

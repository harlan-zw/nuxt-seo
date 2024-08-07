import { applyDefaults } from '../logic/applyDefaults'
import { defineNuxtPlugin, ref, useSiteConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-seo:defaults',
  env: {
    islands: false,
  },
  // we need to wait for the i18n plugin to run first
  // @ts-expect-error dynamic
  dependsOn: import.meta.server
    ? [
        'nuxt-site-config:i18n',
      ]
    : [
        'i18n:plugin',
      ],
  setup(nuxtApp) {
    const siteConfig = useSiteConfig()
    const locale = ref(nuxtApp.$i18n?.locale?.value || siteConfig.currentLocale || siteConfig.defaultLocale)
    // @ts-expect-error untyped
    nuxtApp.hook('i18n:localeSwitched', ({ newLocale }) => {
      locale.value = newLocale
    })
    applyDefaults({ locale })
  },
})

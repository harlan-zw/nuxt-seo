import { applyDefaults } from '../logic/applyDefaults'
import {
  defineNuxtPlugin,
  ref,
  useSiteConfig,
} from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-seo:defaults',
  order: 999,
  env: {
    islands: false,
  },
  setup() {
    const siteConfig = useSiteConfig()
    const locale = ref(siteConfig.currentLocale || siteConfig.defaultLocale)
    applyDefaults({
      locale,
    })
    // TODO reactive locale, need upstream fixes to nuxt-site-config
  },
})

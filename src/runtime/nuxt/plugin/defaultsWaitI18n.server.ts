import { applyDefaults as setup } from '../logic/applyDefaults'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-seo:defaults',
  env: {
    islands: false,
  },
  // we need to wait for the i18n plugin to run first
  dependsOn: [
    // @ts-expect-error dynamic
    'nuxt-site-config:i18n',
  ],
  setup,
})

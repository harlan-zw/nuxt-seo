import NuxtSEO from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSEO,
    '@nuxt/test-utils/module',
  ],

  nitro: {
    prerender: {
      failOnError: false,
    },
  },

  compatibilityDate: '2024-08-07',
})

import NuxtSeo from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSeo,
    '@nuxt/test-utils/module',
  ],

  nitro: {
    prerender: {
      failOnError: false,
    },
  },

  compatibilityDate: '2024-08-07',
})

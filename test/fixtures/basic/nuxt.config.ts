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
  site: {
    url: 'https://local.nuxtseo.com',
  },
  sitemap: {
    credits: false, // breaks snapshot
  },
  compatibilityDate: '2024-08-07',
})

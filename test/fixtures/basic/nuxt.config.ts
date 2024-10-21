import NuxtSEO from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSEO,
    '@nuxt/test-utils/module',
  ],
  ssr: false,
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

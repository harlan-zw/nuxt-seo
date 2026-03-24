import NuxtSEO from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSEO,
    '@nuxt/content',
  ],

  // @ts-ignore
  site: {
    url: 'https://nuxtseo.com',
  },

  ogImage: {
    enabled: false,
  },

  devtools: { enabled: true },
  compatibilityDate: '2024-09-11',
})

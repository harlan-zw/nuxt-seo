import NuxtSeo from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSeo,
    '@nuxtjs/i18n',
    '@nuxt/ui',
  ],
  site: {
    url: 'https://nuxtseo.com',
    debug: true,
  },
  nitro: {
    prerender: {
      failOnError: false,
      ignore: ['/'],
    },
  },
  i18n: {
    baseUrl: 'https://nuxtseo.com',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.ts',
      },
      {
        code: 'es',
        iso: 'es-ES',
        file: 'es.ts',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr.ts',
      },
    ],
  },
})

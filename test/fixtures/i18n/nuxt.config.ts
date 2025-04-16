import { resolve } from 'pathe'
import NuxtSEO from '../../../src/module'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  modules: [
    NuxtSEO,
    '@nuxtjs/i18n',
  ],

  nitro: {
    prerender: {
      failOnError: false,
      ignore: ['/'],
    },
  },

  workspaceDir: resolve(__dirname, '../../..'),

  i18n: {
    baseUrl: 'https://nuxtseo.com',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: 'en.ts',
      },
      {
        code: 'es',
        language: 'es-ES',
        file: 'es.ts',
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: 'fr.ts',
      },
    ],
  },

  compatibilityDate: '2024-08-07',
})

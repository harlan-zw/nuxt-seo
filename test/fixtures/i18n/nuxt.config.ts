import NuxtSEO from '../../../src/module'
import {resolve} from "pathe";

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

  compatibilityDate: '2024-08-07',
})

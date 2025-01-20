import { resolve } from 'pathe'
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
  site: {
    url: 'https://local.nuxtseo.com',
  },
  sitemap: {
    credits: false, // breaks snapshot
  },

  workspaceDir: resolve(__dirname, '../../..'),

  compatibilityDate: '2024-08-07',
})

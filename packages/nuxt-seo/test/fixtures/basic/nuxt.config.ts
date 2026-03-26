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
  // @ts-ignore
  site: {
    url: 'https://local.nuxtseo.com',
    name: '@nuxtjs/seo',
    description: 'Fully equipped Technical SEO for busy Nuxters.',
  },
  sitemap: {
    credits: false, // breaks snapshot
  },
  workspaceDir: resolve(__dirname, '../../..'),

  compatibilityDate: '2024-08-07',
})

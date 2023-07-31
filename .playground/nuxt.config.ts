import { defineNuxtConfig } from 'nuxt/config'
import NuxtSeoKit from '../module/src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSeoKit,
    '@nuxthq/ui',
    'nuxt-icon'
  ],

  devtools: {
    enabled: true,
  },

  site: {
    titleSeparator: '·',
    name: 'Nuxt SEO',
    locale: 'en',
  },

  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } },
    '/secret': { index: false },
  }
})

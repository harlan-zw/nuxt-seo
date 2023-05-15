import { defineNuxtConfig } from 'nuxt/config'
import NuxtSeoKit from '../module/module'

export default defineNuxtConfig({
  modules: [
    NuxtSeoKit,
    'nuxt-windicss',
  ],

  runtimeConfig: {
    public: {
      titleSeparator: '·',
      siteName: 'Nuxt Playground',
      siteDescription: 'A Nuxt 3 playground',
      language: 'en',
    }
  },

  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } },
    '/secret': { index: false },
  }
})

import { defineNuxtConfig } from 'nuxt/config'
import NuxtSeoKit from '../module/module'

export default defineNuxtConfig({
  alias: {
    'windicss': 'nuxt-windicss',
  },
  modules: [
    NuxtSeoKit,
    'windicss',
  ],

  runtimeConfig: {
    public: {
      titleSeparator: '·',
      siteUrl: 'https://harlanzw.com',
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

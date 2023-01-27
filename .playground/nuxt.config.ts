import { defineNuxtConfig } from 'nuxt/config'
import{resolve } from 'pathe'

export default defineNuxtConfig({
  extends: [
    resolve(__dirname, '../layer'),
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

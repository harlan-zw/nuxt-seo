import { defineNuxtConfig } from 'nuxt/config'
import NuxtSeoKit from '../module/module'

export default defineNuxtConfig({
  modules: [
    NuxtSeoKit,
    '@nuxthq/ui',
    'nuxt-icon'
  ],

  runtimeConfig: {
    public: {
      site: {
        titleSeparator: '·',
        name: 'Nuxt Playground',
        description: 'A Nuxt 3 playground',
        language: 'en',
      }
    }
  },

  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } },
    '/secret': { index: false },
  }
})

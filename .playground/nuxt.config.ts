import {NuxtConfig} from "@nuxt/schema";

export default defineNuxtConfig(<NuxtConfig> {
  extends: ['nuxt-seo-kit'],

  runtimeConfig: {
    indexable: true,
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

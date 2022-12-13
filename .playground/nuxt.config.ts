import {NuxtConfig} from "@nuxt/schema";

export default defineNuxtConfig(<NuxtConfig> {
  extends: ['nuxt-seo-kit'],

  runtimeConfig: {
    public: {
      indexable: true,
      siteUrl: 'https://harlanzw.com',
      trailingSlash: true,
      locale: 'en-AU',
    }
  },

  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } },
    '/secret': { index: false },
  }
})

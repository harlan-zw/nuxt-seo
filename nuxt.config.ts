import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    resolve('./modules/nuxt-seo-kit/module'),
    'nuxt-schema-org',
    'nuxt-unhead',
    'nuxt-simple-sitemap',
  ],

  nitro: {
    routeRules: {
      prerender: {
        crawlLinks: true,
        routes: [
          '/',
          '/robots.txt',
          '/sitemap.xml',
        ],
      },
    },
  },

  experimental: {
    componentIslands: true,
  },

  components: [
    {
      prefix: '',
      path: resolve('./components'),
      global: true,
    },
  ],
})

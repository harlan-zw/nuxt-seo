import { createResolver } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  modules: [
    resolve('./modules/nuxt-seo-kit/module'),
    'nuxt-schema-org',
    'nuxt-unhead',
    'nuxt-simple-robots',
    'nuxt-simple-sitemap',
    'nuxt-link-checker',
    'nuxt-og-image',
  ],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
      ],
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

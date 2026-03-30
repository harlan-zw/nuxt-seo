import { resolve } from 'pathe'

export default defineNuxtConfig({
  extends: ['nuxtseo-layer-devtools'],

  seoProDevtools: false,
  robots: false,
  sitemap: false,

  imports: {
    autoImport: true,
  },

  nitro: {
    prerender: {
      routes: ['/', '/keywords', '/pages', '/docs'],
    },
    output: {
      publicDir: resolve(__dirname, '../dist/devtools'),
    },
  },

  app: {
    baseURL: '/__nuxt-seo-pro',
  },
})

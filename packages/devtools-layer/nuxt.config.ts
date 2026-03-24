import { createResolver } from '@nuxt/kit'

const { resolve } = createResolver(import.meta.url)

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@vueuse/nuxt',
  ],

  css: [resolve('./assets/css/global.css')],

  robots: false,
  content: false,
  sitemap: false,

  fonts: {
    families: [
      { name: 'Hubot Sans' },
    ],
  },

  vite: {
    optimizeDeps: {
      include: [
        '@vueuse/core',
      ],
    },
  },

  imports: {
    autoImport: true,
  },

  devtools: {
    enabled: false,
  },

  compatibilityDate: '2026-03-13',
})

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

  runtimeConfig: {
    indexable: process.env.NUXT_INDEXABLE || process.env.NODE_ENV === 'production',
    public: {
      trailingSlash: process.env.NUXT_PUBLIC_TRAILING_SLASH || false,
      titleSeparator: process.env.NUXT_PUBLIC_TITLE_SEPARATOR || '|',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'Nuxt Playground',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000/',
      siteDescription: process.env.NUXT_PUBLIC_SITE_URL || 'My Nuxt v3 website.',
      language: process.env.NUXT_PUBLIC_LANGUAGE || 'en',
    }
  },

  components: [
    {
      prefix: '',
      path: resolve('./components'),
      global: true,
    },
  ],
})

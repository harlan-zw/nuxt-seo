import { defineNuxtConfig } from 'nuxt/config'
import NuxtSEO from '../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSEO,
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  devtools: {
    enabled: true,
  },

  // @ts-expect-error i18n module config
  i18n: {
    locales: ['en', 'it'],
  },

  site: {
    titleSeparator: '·',
    defaultLocale: 'en',
    // TODO play with i18n support
    locales: {
      en: {
        url: 'nuxtseo.dev',
        name: 'Nuxt SEO',
        description: 'Nuxt SEO Playground description.',
      },
      it: {
        url: 'it.nuxtseo.dev',
        name: 'Nuxt SEO It',
        description: 'Nuxt SEO Playground itality description.',
      },
    },
  },

  typescript: {
    includeWorkspace: true,
  },
  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } },
    '/secret': { index: false },
    '/blog/tag': { redirect: { to: '/blog/tags', statusCode: 301 } },
  },

  compatibilityDate: '2024-07-11',
})

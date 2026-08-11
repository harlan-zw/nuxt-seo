import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'
import NuxtSEO from '../../../src/module'

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,

  modules: [
    NuxtSEO,
    '@nuxtjs/i18n',
    'nuxt-ai-ready',
    'nuxt-skew-protection',
  ],

  modulesDir: [resolve(import.meta.dirname, '../../../node_modules')],

  devtools: { enabled: false },
  compatibilityDate: '2026-08-12',

  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-AU' },
      { code: 'fr', language: 'fr-FR' },
    ],
  },

  site: {
    url: 'https://benchmark.example.com',
    name: 'Nuxt SEO Benchmark',
    description: 'SSR performance fixture for the complete Nuxt SEO module stack.',
    defaultLocale: 'en',
  },

  robots: {
    credits: false,
  },

  sitemap: {
    credits: false,
    urls: Array.from({ length: 100 }, (_, index) => ({
      loc: `/products/${index}`,
      changefreq: 'weekly' as const,
    })),
  },

  ogImage: {
    enabled: true,
  },

  linkChecker: {
    enabled: true,
  },

  nitro: {
    externals: {
      inline: ['nuxtseo-shared'],
    },
    minify: false,
    sourceMap: true,
  },

  sourcemap: {
    client: false,
    server: true,
  },
})

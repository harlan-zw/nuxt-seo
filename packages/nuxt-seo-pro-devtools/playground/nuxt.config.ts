import { defineNuxtConfig } from 'nuxt/config'
import NuxtSeoProDevtools from '../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSeoProDevtools,
    'nuxt-site-config',
  ],

  devtools: {
    enabled: true,
  },

  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO Pro Devtools Playground',
  },

  compatibilityDate: '2024-07-11',
})

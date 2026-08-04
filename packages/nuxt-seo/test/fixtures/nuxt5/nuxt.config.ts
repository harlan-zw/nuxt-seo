import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import NuxtSEO from '@nuxtjs/seo'
import NuxtAiReady from 'nuxt-ai-ready'
import NuxtSkewProtection from 'nuxt-skew-protection'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const NitroCompatibility = defineNuxtModule({
  meta: { name: 'nitro3-fixture-compatibility' },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
  },
})

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,
  modulesDir: [resolve(import.meta.dirname, 'node_modules')],

  modules: [
    NitroCompatibility,
    NuxtSEO,
    NuxtAiReady,
    NuxtSkewProtection,
  ],

  site: {
    name: 'Nuxt SEO Nitro 3',
    description: 'Nuxt SEO running on Nitro 3.',
    url: 'https://nitro3.example.com',
  },

  sitemap: {
    credits: false,
  },

  ogImage: {
    debug: true,
    security: {
      secret: false,
    },
  },

  runtimeConfig: {
    nitro3FixtureMarker: 'nitro-3',
  },

  devtools: { enabled: false },
  compatibilityDate: '2026-06-10',
})

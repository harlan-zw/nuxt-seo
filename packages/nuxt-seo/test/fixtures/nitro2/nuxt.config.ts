import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import NuxtSEO from '@nuxtjs/seo'
import NuxtAiReady from 'nuxt-ai-ready'
import NuxtSkewProtection from 'nuxt-skew-protection'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const NitroCompatibility = defineNuxtModule({
  meta: { name: 'nitro2-fixture-compatibility' },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
  },
})

export default defineNuxtConfig({
  extends: ['../nitro-parity'],
  workspaceDir: import.meta.dirname,
  modulesDir: [resolve(import.meta.dirname, 'node_modules')],

  modules: [
    NitroCompatibility,
    NuxtSEO,
    NuxtAiReady,
    NuxtSkewProtection,
  ],

  runtimeConfig: {
    fixtureMarker: 'nitro-2',
  },
})

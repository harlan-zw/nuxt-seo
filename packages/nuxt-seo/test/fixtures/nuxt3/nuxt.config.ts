import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import NuxtSEO from '@nuxtjs/seo'
import { defineNuxtConfig } from 'nuxt/config'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const NitroCompatibility = defineNuxtModule({
  meta: { name: 'nuxt3-fixture-compatibility' },
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
  ],

  runtimeConfig: {
    fixtureMarker: 'nuxt-3',
  },
})

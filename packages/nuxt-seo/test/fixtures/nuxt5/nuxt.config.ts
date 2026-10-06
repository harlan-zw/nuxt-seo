import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const NitroCompatibility = defineNuxtModule({
  meta: { name: 'nitro3-fixture-compatibility' },
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
    '@nuxtjs/seo',
  ],

  runtimeConfig: {
    fixtureMarker: 'nitro-3',
  },
})

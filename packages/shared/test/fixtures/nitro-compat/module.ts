import { defineNuxtModule } from '@nuxt/kit'
import { setupNitroRuntimeCompatibility } from '../../../src/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-nitro-compat-fixture',
  },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
  },
})

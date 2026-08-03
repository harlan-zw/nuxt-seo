import { defineNuxtModule } from 'nuxt/kit'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-nitro-compat-nuxt5-fixture',
  },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
    nuxt.options.nitro.experimental ||= {}
    nuxt.options.nitro.experimental.asyncContext = true
  },
})

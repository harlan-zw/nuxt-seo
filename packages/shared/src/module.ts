import { defineNuxtModule } from '@nuxt/kit'
import { hookNuxtSeoProLicense } from './pro'
import { hookNuxtSeoTelemetry } from './telemetry'

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-shared',
    configKey: 'nuxtSeoShared',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  setup() {
    hookNuxtSeoProLicense()
    hookNuxtSeoTelemetry()
  },
})

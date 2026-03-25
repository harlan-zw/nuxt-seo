import { defineNuxtModule } from '@nuxt/kit'
import { hookNuxtSeoProLicense } from './pro'

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
  },
})

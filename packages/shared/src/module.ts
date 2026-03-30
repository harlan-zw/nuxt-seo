import type { NuxtSeoModuleDetection } from './kit'
import { defineNuxtModule } from '@nuxt/kit'
import { hookNuxtSeoProDataUpload } from './pro'

export interface ModuleHooks {
  'nuxt-seo-pro:modules': (modules: NuxtSeoModuleDetection[]) => Promise<void> | void
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
}

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-shared',
    configKey: 'nuxtSeoShared',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  setup() {
    hookNuxtSeoProDataUpload()
  },
})

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
      nuxt: '^4.6.0 || ^5.0.0',
    },
  },
  setup() {
    hookNuxtSeoProDataUpload()
  },
})

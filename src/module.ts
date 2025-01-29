import {
  defineNuxtModule,
  hasNuxtModule,
  installModule,
} from '@nuxt/kit'
import {
  modules,
} from './const'

export interface ModuleOptions {
  /**
   * Whether the module should be loaded.
   */
  enabled: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxtseo',
    compatibility: {
      nuxt: '>=3.7.0',
      bridge: false,
    },
  },
  defaults: {
    enabled: true,
  },
  async setup(config) {
    if (!config.enabled) {
      return
    }

    for (const module of modules) {
      if (module.npm !== '@nuxtjs/seo') {
        if (!hasNuxtModule(module.npm)) {
          await installModule(module.npm, {})
        }
      }
    }
  },
})

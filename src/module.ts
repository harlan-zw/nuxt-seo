import {
  defineNuxtModule,
  installModule,
  resolvePath,
} from '@nuxt/kit'
import { modules } from './const'

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
    configKey: 'seo',
  },
  defaults: {
    enabled: true,
  },
  async setup(config, nuxt) {
    if (!config.enabled) {
      return
    }
    console.log(nuxt.options.routeRules)
    for (const module of modules)
      await installModule(await resolvePath(module.npm), {}, nuxt)
  },
})

import {createResolver, defineNuxtModule, addTemplate } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {
  indexable: boolean

  host: string

}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    version: '3.0.0',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: false
    },
    configKey: 'site'
  },
  defaults() {
    return {
      indexable: process.env.NODE_ENV === 'production',
      host: 'https://harlanzw.com'
    }
  },
  setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const exports = `const config = ${JSON.stringify(config, null, 2)};\nexport default config`

    // add alias for nuxt app
    const dst = addTemplate({
      filename: 'nuxt-seo-kit-config.mjs',
      getContents: () => exports,
    })
    nuxt.options.alias['#nuxt-seo-kit/config'] = dst.dst

    nuxt.hooks.hook('nitro:config', (nitroConfig) => {
      nitroConfig.externals = defu(typeof nitroConfig.externals === 'object' ? nitroConfig.externals : {}, {
        inline: [
          // Inline module runtime in Nitro bundle
          resolve('./runtime/nitro'),
        ],
      })
      //
      nitroConfig.plugins = nitroConfig.plugins || []
      // config
      nitroConfig.virtual!['nuxt-seo-kit/config'] = exports

      //plugins
      ;['meta', 'sitemap'].forEach((plugin) => {
        nitroConfig.alias[`#nuxt-seo-kit/${plugin}`] = resolve(`./runtime/nitro/${plugin}`)
        nitroConfig.plugins.push(`#nuxt-seo-kit/${plugin}`)
      })

      nitroConfig.hooks = nitroConfig.hooks || {}
    })
  }
})

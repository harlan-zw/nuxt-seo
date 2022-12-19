import { addTemplate, createResolver, defineNuxtModule, logger } from '@nuxt/kit'
import chalk from 'chalk'
import { version } from '../../package.json'
import {withBase} from "ufo";

export interface ModuleOptions {
  indexable: boolean

  hostname: string

  splash: boolean
}

export interface ModulePublicRuntimeConfig {
  indexable: boolean
  siteUrl: string
  siteTitle: string
  siteDescription: string
  trailingSlash: boolean
  language: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: false,
    },
    configKey: 'site',
  },
  defaults(nuxt) {
    return {
      splash: true,
      indexable: (nuxt.options.runtimeConfig.indexable && nuxt.options.runtimeConfig.indexable !== false) || process.env.NODE_ENV === 'production',
      hostname: nuxt.options.runtimeConfig.public.siteUrl || 'localhost:3000',
      trailingSlash: nuxt.options.runtimeConfig.public.trailingSlash,
    }
  },
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // configure nuxt-simple-sitemap
    nuxt.options.sitemap = nuxt.options.sitemap || {}
    nuxt.options.sitemap.hostname = config.hostname
    nuxt.options.sitemap.trailingSlash = config.trailingSlash

    // configure nuxt-schema-org
    nuxt.options.schemaOrg = nuxt.options.schemaOrg || {}
    nuxt.options.schemaOrg.host = config.hostname
    nuxt.options.schemaOrg.inLanguage = nuxt.options.runtimeConfig.public.locale

    nuxt.options.ogImage = nuxt.options.ogImage || {}
    nuxt.options.ogImage.host = config.hostname

    nuxt.options.linkChecker = nuxt.options.linkChecker || {}
    nuxt.options.linkChecker.host = config.hostname

    nuxt.options.robots = nuxt.options.robots || {}

    nuxt.options.robots.sitemap = [
      withBase('/sitemap.xml', config.hostname),
    ]

    nuxt.options.build.transpile.push(...[
      'nuxt-seo-kit',
      resolve('../../server'),
      resolve('../../components'),
      resolve('../../composables'),
    ])

    if (nuxt.options.dev && config.splash) {
      let latestTag = `v${version}`
      try {
        latestTag = (await $fetch<any>('https://ungh.unjs.io/repos/harlan-zw/nuxt-seo-kit/releases/latest')).release.tag
      }
      catch (e) {}
      logger.log(`${chalk.green('Nuxt SEO Kit')} ${chalk.yellow(`v${version}`)} • Super-charging your SEO ${chalk.gray(`by ${chalk.underline('@harlan_zw')}`)}`)
      if (latestTag !== `v${version}`)
        logger.log(`${chalk.gray('  ├─ ')}🎉 New version available!${chalk.gray(` Run ${chalk.underline(`npm i nuxt-seo-kit@${latestTag}`)} to update.`)}`)

      logger.log(chalk.dim('  └─ 💖 Like this package? Consider sponsoring me on GitHub: https://github.com/sponsors/harlan-zw'))
      logger.log('')
    }

    const exports = `const config = ${JSON.stringify(config, null, 2)};\nexport default config`

    // add alias for nuxt app
    const dst = addTemplate({
      filename: 'nuxt-seo-kit-config.mjs',
      getContents: () => exports,
    })
    nuxt.options.alias['#nuxt-seo-kit/config'] = dst.dst

    nuxt.hooks.hook('nitro:config', (nitroConfig) => {
      // config
      nitroConfig.virtual!['nuxt-seo-kit/config'] = exports
    })
  },
})

import { addTemplate, createResolver, defineNuxtModule, logger } from '@nuxt/kit'
import chalk from 'chalk'
import { withBase } from 'ufo'
import { version } from '../../package.json'

interface SeoKitOptions {
  siteUrl: string
  siteName: string
  siteDescription: string
  indexable: boolean
  titleSeparator: string
  trailingSlash: boolean
  language: string
}

export interface ModuleOptions extends SeoKitOptions {
  splash: boolean
}

export interface ModulePublicRuntimeConfig extends SeoKitOptions {
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
      splash: nuxt.options.dev,
      titleSeparator: false,
      indexable: Boolean(nuxt.options.runtimeConfig.indexable) || process.env.NODE_ENV === 'production',
    }
  },
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const map = ['siteName', 'siteDescription', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language']

    for (const k of map)
      config[k] = config[k] || nuxt.options.runtimeConfig.public[k]

    nuxt.options.unhead = nuxt.options.unhead || {}
    nuxt.options.unhead.ogTitleTemplate = `%s ${config.titleSeparator} ${config.siteName}`

    // configure nuxt-simple-sitemap
    nuxt.options.sitemap = nuxt.options.sitemap || {}
    nuxt.options.sitemap.hostname = config.siteUrl
    nuxt.options.sitemap.trailingSlash = config.trailingSlash

    // configure nuxt-schema-org
    nuxt.options.schemaOrg = nuxt.options.schemaOrg || {}
    nuxt.options.schemaOrg.host = config.siteUrl
    nuxt.options.schemaOrg.inLanguage = config.language

    nuxt.options.ogImage = nuxt.options.ogImage || {}
    nuxt.options.ogImage.host = config.siteUrl

    nuxt.options.linkChecker = nuxt.options.linkChecker || {}
    nuxt.options.linkChecker.host = config.siteUrl

    nuxt.options.robots = nuxt.options.robots || {}

    nuxt.options.robots.sitemap = [
      withBase('/sitemap.xml', config.siteUrl),
    ]

    nuxt.options.build.transpile.push(...[
      'nuxt-seo-kit',
      resolve('../../server'),
      resolve('../../components'),
      resolve('../../composables'),
    ])

    if (config.splash) {
      let latestTag = `v${version}`
      try {
        latestTag = (await $fetch<any>('https://ungh.unjs.io/repos/harlan-zw/nuxt-seo-kit/releases/latest')).release.tag
      }
      catch (e) {}
      logger.log(`${chalk.green('Nuxt SEO Kit')} ${chalk.yellow(`v${version}`)} • Super-charging your SEO ${chalk.gray(`by ${chalk.underline('@harlan_zw')}`)}`)
      if (latestTag !== `v${version}`)
        logger.log(`${chalk.gray('  ├─ ')}🎉 New version available!${chalk.gray(` Run ${chalk.underline(`npm i nuxt-seo-kit@${latestTag}`)} to update.`)}`)

      logger.log(chalk.dim('  └─ 💖  Like this package? Consider sponsoring me on GitHub: https://github.com/sponsors/harlan-zw'))
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
      nitroConfig.virtual!['nuxt-seo-kit/config'] = exports
    })
  },
})

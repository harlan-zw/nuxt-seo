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

const publicRuntimeConfigKeys = ['siteName', 'siteDescription', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language'] as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    compatibility: {
      nuxt: '^3.0.0',
      bridge: false,
    },
    configKey: 'site',
  },
  // @ts-expect-error type issue
  defaults(nuxt) {
    const defaults: Record<any, any> = {}
    for (const k of publicRuntimeConfigKeys)
      defaults[k] = nuxt.options.runtimeConfig.public[k]
    let indexable = true
    if (typeof process.env.NUXT_INDEXABLE !== 'undefined')
      indexable = String(process.env.NUXT_INDEXABLE) !== 'false'
    else if (typeof nuxt.options.runtimeConfig.indexable !== 'undefined')
      indexable = String(nuxt.options.runtimeConfig.indexable) !== 'false'
    else if (process.env.NODE_ENV !== 'production')
      indexable = false
    return {
      splash: nuxt.options.dev,
      ...defaults,
      indexable,
    }
  },
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // configure nuxt-unhead
    nuxt.options.unhead = defu(nuxt.options.unhead || {}, {
      ogTitleTemplate: `%s ${config.titleSeparator} ${config.siteName}`,
    })
    // configure nuxt-simple-sitemap
    nuxt.options.sitemap = defu(nuxt.options.sitemap || {}, {
      hostname: config.siteUrl,
      trailingSlash: config.trailingSlash,
    })
    // configure nuxt-schema-org
    nuxt.options.schemaOrg = defu(nuxt.options.schemaOrg || {}, {
      host: config.siteUrl,
      inLanguage: config.language,
      trailingSlash: config.trailingSlash,
    })
    // configure nuxt-og-image
    nuxt.options.ogImage = defu(nuxt.options.ogImage || {}, {
      host: config.siteUrl,
    })
    // configure nuxt-link-checker
    nuxt.options.linkChecker = defu(nuxt.options.linkChecker || {}, {
      host: config.siteUrl,
      trailingSlash: config.trailingSlash,
    })
    // configure nuxt-simple-robots
    nuxt.options.robots = defu(nuxt.options.robots || {}, {
      indexable: config.indexable,
      sitemap: [
        withBase('/sitemap.xml', config.siteUrl),
      ],
    })

    nuxt.options.build.transpile.push(...[
      'nuxt-seo-kit',
      resolve('../../server'),
      resolve('../../components'),
      resolve('../../composables'),
    ])

    if (config.splash) {
      logger.log('')
      let latestTag = `v${version}`
      try {
        latestTag = (await $fetch<any>('https://ungh.unjs.io/repos/harlan-zw/nuxt-seo-kit/releases/latest')).release.tag
      }
      catch (e) {}
      logger.log(`${chalk.green('SEO Kit')} ${chalk.yellow(`v${version}`)} • All-in-one SEO ${chalk.gray(`by ${chalk.underline('@harlan_zw')}`)}`)
      if (latestTag !== `v${version}`)
        logger.log(`${chalk.gray('  ├─ ')}🎉 New version available!${chalk.gray(` Run ${chalk.underline(`npm i nuxt-seo-kit@${latestTag}`)} to update.`)}`)

      logger.log(chalk.dim('  └─ 💖  Like this package? Consider sponsoring me on GitHub https://github.com/sponsors/harlan-zw'))
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

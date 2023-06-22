import {
  addComponentsDir,
  addImportsDir,
  createResolver,
  defineNuxtModule,
  installModule,
  logger,
} from '@nuxt/kit'
import chalk from 'chalk'
import defu from 'defu'
import { version } from './package.json'
import type { SeoKitOptions } from './types'

export interface ModuleOptions extends SeoKitOptions {
  splash: boolean
}

export interface ModulePublicRuntimeConfig extends SeoKitOptions {
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    compatibility: {
      nuxt: '^3.5.0',
      bridge: false,
    },
    configKey: 'seoKit',
  },
  // @ts-expect-error type issue
  defaults(nuxt) {
    return {
      splash: nuxt.options.dev,
    }
  },
  async setup(config, nuxt) {
    // nuxt.options.runtimeConfig.public['nuxt-seo-kit'] = config

    const { resolve, resolvePath } = createResolver(import.meta.url)

    // all modules require this
    await installModule(await resolvePath('nuxt-site-config'))

    await installModule(await resolvePath('nuxt-seo-ui'))

    const sitemapPath = await resolvePath('nuxt-simple-sitemap')
    // configure nuxt-simple-sitemap
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    if (nuxt.options.sitemap !== false) {
      // @ts-expect-error runtime type
      nuxt.options.sitemap = defu(nuxt.options.sitemap || {}, {
        hostname: config.siteUrl,
        trailingSlash: config.trailingSlash,
      })
      await installModule(sitemapPath)
    }
    // configure nuxt-schema-org
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    if (nuxt.options.schemaOrg !== false) {
      // @ts-expect-error runtime type
      nuxt.options.schemaOrg = defu(nuxt.options.schemaOrg || {}, {
        host: config.siteUrl,
        inLanguage: config.language,
        trailingSlash: config.trailingSlash,
      })
      await installModule(await resolvePath('nuxt-schema-org'))
    }
    // configure nuxt-og-image
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    if (nuxt.options.ogImage !== false) {
      nuxt.options.ogImage = defu(nuxt.options.ogImage || {}, {
        host: config.siteUrl,
      })
      await installModule(await resolvePath('nuxt-og-image'))
    }
    // configure nuxt-link-checker
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    if (nuxt.options.linkChecker !== false) {
      nuxt.options.linkChecker = defu(nuxt.options.linkChecker || {}, {
        host: config.siteUrl,
        trailingSlash: config.trailingSlash,
      })
      await installModule(await resolvePath('nuxt-link-checker'))
    }
    // configure nuxt-simple-robots
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore runtime type
    if (nuxt.options.robots !== false) {
      nuxt.options.robots = defu(nuxt.options.robots || {}, {
        indexable: config.indexable,
      })
      await installModule(await resolvePath('nuxt-simple-robots'))
    }

    const componentsDir = resolve('./runtime/components')

    nuxt.options.build.transpile.push(...[
      componentsDir,
      resolve('./runtime/composables'),
      // dirname(sitemapPath),
    ])

    addComponentsDir({ path: componentsDir })
    addImportsDir(resolve('./runtime/composables'))

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

      logger.log(chalk.dim('  └─ 💖 Care about SEO? Support the development https://github.com/sponsors/harlan-zw'))
      logger.log('')
    }
  },
})

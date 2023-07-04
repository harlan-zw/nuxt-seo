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
import { version } from '../package.json'

export interface ModuleOptions {
  splash: boolean
}

const Modules = [
  'nuxt-site-config',
  'nuxt-seo-ui',
  'nuxt-simple-sitemap',
  'nuxt-simple-robots',
  'nuxt-schema-org',

]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    compatibility: {
      nuxt: '^3.6.1',
      bridge: false,
    },
    configKey: 'seoKit',
  },
  defaults(nuxt) {
    return {
      splash: nuxt.options.dev,
    }
  },
  async setup(config, nuxt) {
    // nuxt.options.runtimeConfig.public['nuxt-seo-kit'] = config

    const { resolve, resolvePath } = createResolver(import.meta.url)

    for (const module of Modules)
      await installModule(await resolvePath(module))

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
    await installModule(await resolvePath('nuxt-simple-robots'))

    const componentsDir = resolve('./runtime/components')

    nuxt.options.build.transpile.push(...[
      componentsDir,
      resolve('./runtime/composables'),
    ])

    await addComponentsDir({ path: componentsDir })
    addImportsDir(resolve('./runtime/composables'))

    if (config.splash) {
      logger.log('')
      let latestTag = `v${version}`
      try {
        latestTag = (await $fetch<any>('https://ungh.unjs.io/repos/harlan-zw/nuxt-seo-kit/releases/latest')).release.tag
      }
      catch (e) {}
      const upToDate = latestTag === `v${version}`
      logger.log(`${chalk.green('Nuxt SEO')} ${chalk.yellow(`v${version}`)} ${chalk.gray(`by ${chalk.underline('@harlan_zw')}`)}`)
      if (!upToDate)
        logger.log(`${chalk.gray('  ├─ ')}🎉 New version available!${chalk.gray(` Run ${chalk.underline(`npm i nuxt-seo-kit@${latestTag}`)} to update.`)}`)

      logger.log(chalk.dim('  └─ 💖 Care about Nuxt SEO? Support the development https://nuxt-seo.com/sponsor'))
      logger.log('')
    }
  },
})

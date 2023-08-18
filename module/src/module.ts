import {
  addImports, addPlugin,
  createResolver,
  defineNuxtModule,
  installModule, useLogger,
} from '@nuxt/kit'
import chalk from 'chalk'
import { installNuxtSiteConfig } from 'nuxt-site-config-kit'
import { version } from '../package.json'

export interface ModuleOptions {
  enabled: boolean
  debug: boolean
  splash: boolean
}

const Modules = [
  'nuxt-simple-robots',
  'nuxt-simple-sitemap',
  'nuxt-og-image',
  'nuxt-seo-ui',
  'nuxt-schema-org',
  'nuxt-seo-experiments',
  'nuxt-link-checker',
]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-seo-kit',
    compatibility: {
      nuxt: '^3.6.5',
      bridge: false,
    },
    configKey: 'seoKit',
  },
  defaults(nuxt) {
    return {
      enabled: true,
      debug: false,
      splash: nuxt.options.dev,
    }
  },
  async setup(config, nuxt) {
    const logger = useLogger('nuxtseo')
    logger.level = (config.debug || nuxt.options.debug) ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }

    const { resolve, resolvePath } = createResolver(import.meta.url)

    await installNuxtSiteConfig()

    for (const module of Modules)
      await installModule(await resolvePath(module))

    addPlugin({
      src: resolve('./runtime/plugin/defaults'),
    })

    // if user disables certain modules we need to pollyfill the imports
    const polyfills: Record<string, string[]> = {
      robots: ['defineRobotMeta'],
      schemaOrg: ['useSchemaOrg', 'defineWebSite', 'defineWebPage'],
    }
    for (const [module, composables] of Object.entries(polyfills)) {
      // @ts-expect-error untyped
      if (nuxt.options[module]?.enable === false) {
        composables.forEach((name) => {
          // add pollyfill
          addImports({
            from: resolve('./runtime/composables/polyfills'),
            name,
          })
        })
      }
    }
    // @ts-expect-error untyped
    nuxt.options.experimental.headNext = true

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

      logger.log(chalk.dim('  └─ 💖 Care about Nuxt SEO? Support the development https://nuxtseo.com/sponsor'))
      logger.log('')
    }
  },
})

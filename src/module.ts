import {
  addImports,
  addPlugin,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  installModule,
  useLogger,
} from '@nuxt/kit'
import chalk from 'chalk'
import { installNuxtSiteConfig } from 'nuxt-site-config-kit'
import { version } from '../package.json'

export interface ModuleOptions {
  /**
   * Will ensure a title is always set by providing a fallback title based on the casing the last slug segment.
   *
   * @default true
   */
  fallbackTitle?: boolean
  /**
   * Will set up a number of defaults for meta tags and Schema.org, if the modules and config are available.
   *
   * @default true
   */
  automaticDefaults?: boolean
  /**
   * When enabled, it will redirect any request to the canonical domain (site url) using a 301 redirect on non-dev environments.
   *
   * E.g if the site url is 'www.example.com' and the user visits 'example.com',
   * they will be redirected to 'www.example.com'.
   *
   * This is useful for SEO as it prevents duplicate content and consolidates page rank.
   *
   * @default false
   */
  redirectToCanonicalSiteUrl?: boolean
  /**
   * Whether the module should be loaded.
   */
  enabled: boolean
  /**
   * Whether the debugging mode should be enabled.
   *
   * @default `nuxt.options.debug`
   */
  debug: boolean
  /**
   * Whether the Nuxt SEO splash should be shown when Nuxt is started.
   *
   * @default `nuxt.options.dev`
   */
  splash: boolean
}

const Modules = [
  'nuxt-simple-robots',
  '@nuxtjs/sitemap',
  'nuxt-og-image',
  'nuxt-schema-org',
  'nuxt-seo-experiments',
  'nuxt-link-checker',
]

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxtseo',
    compatibility: {
      nuxt: '^3.7.0',
      bridge: false,
    },
    configKey: 'seo',
  },
  defaults(nuxt) {
    return {
      enabled: true,
      debug: nuxt.options.debug,
      redirectToCanonicalSiteUrl: false,
      splash: nuxt.options.dev,
      automaticDefaults: true,
      fallbackTitle: true,
    }
  },
  async setup(config, nuxt) {
    const logger = useLogger('@nuxtjs/seo')
    logger.level = config.debug ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }

    const { resolve, resolvePath } = createResolver(import.meta.url)

    await installNuxtSiteConfig()

    // TODO disable modules if SSR is disabled
    // if (!nuxt.options.ssr) {
    //   nuxt.options.schemaOrg = defu({ enabled: false}, nuxt.options.schemaOrg)
    //   nuxt.options.ogImage = defu({ enabled: false}, nuxt.options.ogImage)
    //   logger.warn('SSR is required for Nuxt OG Image and Nuxt Schema.org, disabling them.')
    // }

    for (const module of Modules)
      await installModule(await resolvePath(module))

    if (config.automaticDefaults) {
      addPlugin({
        src: resolve('./runtime/nuxt/plugin/defaults'),
      })
    }
    if (config.fallbackTitle) {
      addPlugin({
        src: resolve('./runtime/nuxt/plugin/titles'),
      })
    }

    if (!hasNuxtModule('@nuxtjs/i18n')) {
      addImports({
        from: resolve(`./runtime/nuxt/composables/polyfills`),
        name: 'useI18n',
      })
    }

    addImports({
      from: resolve(`./runtime/nuxt/composables/useBreadcrumbItems`),
      name: 'useBreadcrumbItems',
    })

    // if user disables certain modules we need to pollyfill the imports
    const polyfills: Record<string, string[]> = {
      schemaOrg: ['useSchemaOrg', 'defineWebSite', 'defineWebPage'],
    }
    for (const [module, composables] of Object.entries(polyfills)) {
      if (nuxt.options[module as keyof typeof nuxt.options]?.enable === false) {
        composables.forEach((name) => {
          // add pollyfill
          addImports({
            from: resolve('./runtime/nuxt/composables/polyfills'),
            name,
          })
        })
      }
    }
    nuxt.options.experimental.headNext = true

    // add redirect middleware
    if (config.redirectToCanonicalSiteUrl) {
      addServerHandler({
        handler: resolve('./runtime/nitro/middleware/redirect'),
        middleware: true,
      })
    }

    if (config.splash) {
      logger.log('')
      let latestTag = `v${version}`
      try {
        latestTag = (await $fetch<any>('https://ungh.unjs.io/repos/harlan-zw/nuxt-seo/releases/latest')).release.tag
      }
      catch (e) {}
      const upToDate = latestTag === `v${version}`
      logger.log(`${chalk.green('Nuxt SEO')} ${chalk.yellow(`v${version}`)} ${chalk.gray(`by ${chalk.underline('@harlan_zw')}`)}`)
      if (!upToDate)
        logger.log(`${chalk.gray('  ├─ ')}🎉 New version available!${chalk.gray(` Run ${chalk.underline(`npm i @nuxtjs/seo@${latestTag}`)} to update.`)}`)

      logger.log(chalk.dim('  └─ 🧪 Help get Nuxt SEO stable by providing feedback https://github.com/harlan-zw/nuxt-seo/discussions/108'))
      logger.log('')
    }
  },
})

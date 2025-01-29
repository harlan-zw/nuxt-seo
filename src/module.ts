import {
  defineNuxtModule,
  installModule,
} from '@nuxt/kit'
import RobotsModule from '@nuxtjs/robots'
import SitemapModule from '@nuxtjs/sitemap'
import LinkCheckerModule from 'nuxt-link-checker'
import OgImageModule from 'nuxt-og-image'
import SchemaOrgModule from 'nuxt-schema-org'
import SeoUtilsModule from 'nuxt-seo-utils'
import SiteConfigModule from 'nuxt-site-config'
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
  async setup(config, nuxt) {
    if (!config.enabled) {
      return
    }
    for (const module of modules) {
      if (module.npm !== '@nuxtjs/seo') {
        await installModule(SiteConfigModule, {}, nuxt)
        await installModule(RobotsModule, {}, nuxt)
        await installModule(SitemapModule, {}, nuxt)
        await installModule(OgImageModule, {}, nuxt)
        await installModule(SchemaOrgModule, {}, nuxt)
        await installModule(LinkCheckerModule, {}, nuxt)
        await installModule(SeoUtilsModule, {}, nuxt)
      }
    }
  },
})

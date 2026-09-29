import type { ModuleDependencies } from '@nuxt/schema'
import {
  defineNuxtModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Install the bundled Nuxt SEO modules. Set to `false` to install none of them, the same as
   * `nuxtseo: false`. A module you add to `modules` yourself still installs.
   *
   * @default true
   */
  enabled: boolean
}

const moduleDependencies = {
  '@nuxtjs/robots': {
    version: '>=5.5',
  },
  '@nuxtjs/sitemap': {
    version: '>=7.4',
  },
  'nuxt-link-checker': {
    version: '>=4.3',
  },
  'nuxt-og-image': {
    // 6.4.3 could fail to load a native transitive binding (oxc-parser/lightningcss)
    // in some environments, surfacing as a cryptic "Could not load nuxt-og-image".
    version: '>=6.4.4',
  },
  'nuxt-schema-org': {
    version: '>=5.0',
  },
  'nuxt-seo-utils': {
    version: '>=7.0',
  },
  'nuxt-site-config': {
    version: '>=3.2',
  },
  'nuxt-skew-protection': {
    version: '>=1.0',
    optional: true,
  },
  'nuxt-ai-ready': {
    version: '>=1.0',
    optional: true,
  },
  '@nuxtjs/i18n': {
    version: '>=10.0',
    optional: true,
  },
} satisfies ModuleDependencies

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxtseo',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  moduleDependencies(nuxt) {
    // Nuxt installs dependencies before it checks whether this module is disabled, so a
    // disabled Nuxt SEO must return none.
    const options = (nuxt.options as { nuxtseo?: Partial<ModuleOptions> | false }).nuxtseo
    if (options === false || options?.enabled === false)
      return {}
    return moduleDependencies
  },
  defaults: {
    enabled: true,
  },
  async setup() {},
})

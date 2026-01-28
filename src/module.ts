import {
  defineNuxtModule,
} from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Whether the module should be loaded.
   * @deprecated Does not do anything
   */
  enabled: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxtseo',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  moduleDependencies: {
    '@nuxtjs/robots': {
      version: '^5.5',
    },
    '@nuxtjs/sitemap': {
      version: '^7.4',
    },
    'nuxt-link-checker': {
      version: '^4.3',
    },
    'nuxt-og-image': {
      version: '>=5.1',
    },
    'nuxt-schema-org': {
      version: '^5.0',
    },
    'nuxt-seo-utils': {
      version: '^7.0',
    },
    'nuxt-site-config': {
      version: '^3.2',
    },
  },
  defaults: {
    enabled: true,
  },
  async setup() {},
})

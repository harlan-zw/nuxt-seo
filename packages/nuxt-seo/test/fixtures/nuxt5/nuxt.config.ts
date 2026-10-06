import NuxtSeo from '@nuxtjs/seo'
import NuxtSiteConfig from 'nuxt-site-config'
import NuxtRobots from '@nuxtjs/robots'
import NuxtSitemap from '@nuxtjs/sitemap'
import NuxtOgImage from 'nuxt-og-image'
import NuxtSchemaOrg from 'nuxt-schema-org'
import NuxtSeoUtils from 'nuxt-seo-utils'
import NuxtLinkChecker from 'nuxt-link-checker'
import NuxtAiReady from 'nuxt-ai-ready'
import NuxtSkewProtection from 'nuxt-skew-protection'
import NuxtSeoShared from 'nuxtseo-shared'
import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { setupNitroRuntimeCompatibility } from 'nuxtseo-shared/kit'

const NitroCompatibility = defineNuxtModule({
  meta: { name: 'nitro3-fixture-compatibility' },
  setup(_options, nuxt) {
    setupNitroRuntimeCompatibility(nuxt)
  },
})

for (const module of [NuxtSeo, NuxtSiteConfig, NuxtRobots, NuxtSitemap, NuxtOgImage, NuxtSchemaOrg, NuxtSeoUtils, NuxtLinkChecker, NuxtAiReady, NuxtSkewProtection, NuxtSeoShared]) {
  const meta = await module.getMeta?.()
  if (meta) meta.compatibility = { ...meta.compatibility, nuxt: '^4.6.0 || ^5.0.0 || 5.0.0-2610061032-c7ad8cd' }
}

export default defineNuxtConfig({
  vite: { resolve: { dedupe: ['nuxt', 'vue', 'vue-router'] } },
  extends: ['../nitro-parity'],
  workspaceDir: import.meta.dirname,
  modulesDir: [resolve(import.meta.dirname, 'node_modules')],
  nitro: { traceDeps: ['@takumi-rs/core*'] },

  modules: [
    NitroCompatibility,
    '@nuxtjs/seo',
  ],

  runtimeConfig: {
    fixtureMarker: 'nitro-3',
  },
})

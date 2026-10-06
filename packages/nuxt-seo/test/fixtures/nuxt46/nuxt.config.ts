import type { Nuxt } from 'nuxt/schema'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { getNitroVersion } from '@nuxt/kit'
import NuxtRobots from '@nuxtjs/robots'
import NuxtSEO from '@nuxtjs/seo'
import NuxtSitemap from '@nuxtjs/sitemap'
import NuxtLinkChecker from 'nuxt-link-checker'
import NuxtOgImage from 'nuxt-og-image'
import NuxtSchemaOrg from 'nuxt-schema-org'
import NuxtSeoUtils from 'nuxt-seo-utils'
import NuxtSiteConfig from 'nuxt-site-config'
import NuxtSeoShared from 'nuxtseo-shared'

const mode = process.env.NUXT_TEST_CASE || 'enabled'
const enabled = mode === 'enabled' || mode === 'overrides'
const override = mode === 'overrides'
// Resolve required producers from the packed meta module's dependency context.
const require = createRequire(import.meta.url)
const metaRequire = createRequire(require.resolve('@nuxtjs/seo'))
const standaloneModules = (await Promise.all(['nuxt-ai-ready', 'nuxt-skew-protection'].map(name => import(pathToFileURL(metaRequire.resolve(name)).href)))).map(module => module.default)
const bundledExtrasDisabled = mode === 'modules-disabled' || process.env.NUXT_TEST_STANDALONE === '0'
const modules = [NuxtSEO, NuxtRobots, NuxtSitemap, NuxtLinkChecker, NuxtOgImage, NuxtSchemaOrg, NuxtSeoUtils, NuxtSiteConfig, NuxtSeoShared, ...standaloneModules]
// Enable exactly the pinned nightly in this fixture. Published ranges remain stable.
if (process.env.NUXT_TEST_LANE === 'nuxt5') {
  for (const module of modules) {
    const meta = await module.getMeta?.()
    if (!meta)
      throw new Error('The packed module must expose compatibility metadata.')
    meta.compatibility ||= {}
    meta.compatibility.nuxt = '^4.6.0 || ^5.0.0 || 5.0.0-2610052343-36eafab'
  }
}

function verifyBuilder(_options: unknown, nuxt: Nuxt) {
  nuxt.hook('modules:done', () => {
    const expected = process.env.NUXT_TEST_LANE === 'nuxt5' ? 3 : 2
    if (getNitroVersion(nuxt) !== expected)
      throw new Error('The packed fixture resolved the wrong server builder.')
    nuxt.options.runtimeConfig.fixtureModules = nuxt.options._installedModules
      .filter(module => !module.meta?.disabled)
      .map(module => module.meta?.name)
      .filter(Boolean)
  })
}

export default defineNuxtConfig({
  future: { compatibilityVersion: process.env.NUXT_TEST_LANE === 'nuxt4' ? 4 : 5 },
  modules: [verifyBuilder, NuxtSEO, ...(mode === 'explicit' ? [NuxtRobots] : [])],
  nuxtseo: mode === 'bundle-disabled' || mode === 'explicit' ? false : { enabled: mode !== 'enabled-false' },
  site: { enabled: mode !== 'modules-disabled', name: override ? 'User Override' : 'Combined SEO', url: override ? 'https://override.example.com' : 'https://combined.example.com' },
  robots: mode === 'modules-disabled' ? false : { credits: false, ...(override ? { disallow: ['/blocked'] } : {}) },
  sitemap: mode === 'modules-disabled' ? { enabled: false } : { credits: false, ...(override ? { urls: ['/custom'], exclude: ['/about'] } : {}) },
  ogImage: mode === 'modules-disabled' || override ? false : { security: { secret: false } },
  schemaOrg: mode === 'modules-disabled' || override ? false : {},
  seo: mode === 'modules-disabled' ? false : { metaDataFiles: false },
  linkChecker: mode === 'modules-disabled' || override ? { enabled: false } : { runOnBuild: true, report: { json: true, publish: true } },
  aiReady: bundledExtrasDisabled ? false : { database: { type: 'sqlite' } },
  skewProtection: bundledExtrasDisabled ? false : override ? { cookie: { name: '__fixture_version', maxAge: 1200 } } : {},
  mcp: false,
  runtimeConfig: { fixtureMode: mode, fixtureModules: [] as string[] },
  nitro: { prerender: { routes: enabled ? ['/'] : [], crawlLinks: false } },
  devtools: { enabled: false },
  compatibilityDate: '2026-10-06',
})

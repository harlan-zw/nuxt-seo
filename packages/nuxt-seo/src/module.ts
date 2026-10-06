import type { ModuleDependencies } from '@nuxt/schema'
import {
  defineNuxtModule,
  getNuxtVersion,
  hasNuxtCompatibility,
  normalizeSemanticVersion,
} from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import { satisfies } from 'semver'
import { setupDevelopmentChecks } from './setup'

export interface ModuleOptions {
  /**
   * Install the bundled Nuxt SEO modules. Set to `false` to install none of them, the same as
   * `nuxtseo: false`. A module you add to `modules` yourself still installs.
   *
   * @default true
   */
  enabled: boolean
  /**
   * Show optional configuration tips in development. Required setup checks stay active.
   *
   * @default true
   */
  tips: boolean
}

/**
 * `moduleDependencies` arrived in Nuxt 3.19 and 4.1. Nuxt 3.19 fails the current dev and
 * typecheck fixture, so the supported Nuxt 3 range starts at 3.21.11. Enforce this range in
 * `setup()` because incompatible `meta.compatibility` only logs a warning and skips the module.
 */
const NUXT_COMPATIBILITY = '^3.21.11 || >=4.1.0'

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
    tips: true,
  },
  async setup(options, nuxt) {
    // `nuxtseo: false` never reaches setup. `enabled: false` installs no module, so there is
    // nothing to check.
    if (!options.enabled)
      return
    if (!await hasNuxtCompatibility({ nuxt: NUXT_COMPATIBILITY }, nuxt)) {
      throw new Error(`[@nuxtjs/seo] Nuxt ${getNuxtVersion(nuxt)} is unsupported. Upgrade Nuxt to \`${NUXT_COMPATIBILITY}\`.`)
    }
    setupDevelopmentChecks(nuxt, { tips: options.tips })
    // Nuxt checks each dependency version against the copy nested in @nuxtjs/seo, but loads the
    // copy the app resolves. Check the modules that actually installed. Read package.json from the
    // app's module directories first, as Nuxt does when it loads a module: a module.json version
    // can lag one release behind.
    nuxt.hook('modules:done', async () => {
      const issues: string[] = []
      for (const { meta } of nuxt.options._installedModules) {
        const requirement = moduleDependencies[meta?.name as keyof typeof moduleDependencies]
        if (!requirement || meta.disabled)
          continue
        const pkg = await readPackageJSON(meta.name!, { from: nuxt.options.modulesDir })
          .catch(() => {
            // Safe to ignore: an inline or aliased module has no package.json the app resolves,
            // so the version the module reports is the best source.
            return undefined
          })
        const version = pkg?.version || meta.version
        if (version && !satisfies(normalizeSemanticVersion(version), requirement.version, { includePrerelease: true }))
          issues.push(`Module \`${meta.name}\` version (\`${version}\`) does not satisfy \`${requirement.version}\` (requested by \`@nuxtjs/seo\`).`)
      }
      if (issues.length)
        throw new Error(`[@nuxtjs/seo] ${issues.join('\n')}`)
    })
  },
})

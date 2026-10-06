import type { ModuleDependencies } from '@nuxt/schema'
import {
  defineNuxtModule,
  getNuxtVersion,
  hasNuxtCompatibility,
  normalizeSemanticVersion,
} from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import { satisfies } from 'semver'

export interface ModuleOptions {
  /**
   * Install the bundled Nuxt SEO modules. Set to `false` to install none of them, the same as
   * `nuxtseo: false`. A module you add to `modules` yourself still installs.
   *
   * @default true
   */
  enabled: boolean
}

/**
 * The bundled AI Ready and Skew Protection modules require Nuxt 4. Nuxt 4.1 adds
 * `moduleDependencies`. Enforce the range because incompatible `meta.compatibility`
 * only logs a warning and skips the module.
 */
const NUXT_COMPATIBILITY = '>=4.1.0'

const moduleDependencies = {
  '@nuxtjs/robots': {
    version: '>=6.0',
  },
  '@nuxtjs/sitemap': {
    version: '>=8.3',
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
    version: '>=4.0',
  },
  'nuxt-skew-protection': {
    version: '>=1.6.2',
    defaults: {
      // Native manifest polling works on static, serverless, and Node deployments.
      updateStrategy: 'polling',
      // Asset retention works without adding cookies to every document response.
      cookie: false,
    },
  },
  'nuxt-ai-ready': {
    version: '>=2.5.3',
    defaults: {
      // Publishing project instructions and server route catalogs requires opt-in.
      agentSkills: false,
      apiCatalog: false,
    },
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
    // Dependency defaults turn a false config key into an object in Nuxt.
    // Omit defaults for disabled modules so their own disable switch still works.
    return {
      ...moduleDependencies,
      'nuxt-ai-ready': {
        ...moduleDependencies['nuxt-ai-ready'],
        defaults: nuxt.options.aiReady === false ? undefined : moduleDependencies['nuxt-ai-ready'].defaults,
      },
      'nuxt-skew-protection': {
        ...moduleDependencies['nuxt-skew-protection'],
        defaults: nuxt.options.skewProtection === false ? undefined : moduleDependencies['nuxt-skew-protection'].defaults,
      },
    }
  },
  defaults: {
    enabled: true,
  },
  async setup(options, nuxt) {
    // `nuxtseo: false` never reaches setup. `enabled: false` installs no module, so there is
    // nothing to check.
    if (!options.enabled)
      return
    if (!await hasNuxtCompatibility({ nuxt: NUXT_COMPATIBILITY }, nuxt)) {
      throw new Error(`[@nuxtjs/seo] Nuxt ${getNuxtVersion(nuxt)} is unsupported. Upgrade Nuxt to \`${NUXT_COMPATIBILITY}\`.`)
    }
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

import type { ModuleDependencies } from '@nuxt/schema'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { defineNuxtModule, normalizeSemanticVersion } from '@nuxt/kit'
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

const NUXT_COMPATIBILITY = '^4.6.0 || ^5.0.0'

async function resolveInstalledVersion(name: string, modulesDirs: string[]): Promise<string | undefined> {
  for (const dir of modulesDirs) {
    const source = await readFile(join(dir, name, 'package.json'), 'utf8').catch((error: unknown) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT')
        return undefined
      throw error
    })
    if (source === undefined)
      continue
    const metadata: unknown = JSON.parse(source)
    if (metadata && typeof metadata === 'object' && 'version' in metadata && typeof metadata.version === 'string')
      return metadata.version
    // This directory resolved the installed package. Later copies cannot supply its metadata.
    return undefined
  }
}

const moduleDependencies = {
  '@nuxtjs/robots': {
    version: '^7.0.0',
  },
  '@nuxtjs/sitemap': {
    version: '^9.0.0',
  },
  'nuxt-link-checker': {
    version: '^6.0.0',
  },
  'nuxt-og-image': {
    version: '^7.0.0',
  },
  'nuxt-schema-org': {
    version: '^7.0.0',
  },
  'nuxt-seo-utils': {
    version: '^9.0.0',
  },
  'nuxt-site-config': {
    version: '^5.0.0',
  },
  'nuxt-skew-protection': {
    version: '^2.0.0',
    optional: true,
  },
  'nuxt-ai-ready': {
    version: '^3.0.0',
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
    compatibility: { nuxt: NUXT_COMPATIBILITY },
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
  async setup(options, nuxt) {
    // `nuxtseo: false` never reaches setup. `enabled: false` installs no module, so there is
    // nothing to check.
    if (!options.enabled)
      return
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
        const version = await resolveInstalledVersion(meta.name!, nuxt.options.modulesDir) || meta.version
        if (version && !satisfies(normalizeSemanticVersion(version), requirement.version, { includePrerelease: true }))
          issues.push(`Module \`${meta.name}\` version (\`${version}\`) does not satisfy \`${requirement.version}\` (requested by \`@nuxtjs/seo\`).`)
      }
      if (issues.length)
        throw new Error(`[@nuxtjs/seo] ${issues.join('\n')}`)
    })
  },
})

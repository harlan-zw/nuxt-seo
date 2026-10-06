import type { Nuxt } from '@nuxt/schema'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import NuxtSEO from '../../src/module'

interface InstalledModule { meta: { name: string, version?: string, disabled?: boolean } }

/**
 * A Nuxt stand-in whose module directory holds the given package versions, the copies the app
 * resolves and loads.
 */
function createNuxt(version: string, packages: Record<string, string> = {}, directory = 'node_modules') {
  const modulesDir = join(mkdtempSync(join(tmpdir(), 'nuxt-seo-')), directory)
  for (const [name, pkgVersion] of Object.entries(packages)) {
    mkdirSync(join(modulesDir, name), { recursive: true })
    writeFileSync(join(modulesDir, name, 'package.json'), JSON.stringify({ name, version: pkgVersion, main: 'index.mjs' }))
    writeFileSync(join(modulesDir, name, 'index.mjs'), 'export default () => {}')
  }
  const hooks = new Map<string, Array<() => unknown>>()
  return {
    _version: version,
    options: {
      _requiredModules: {},
      _installedModules: [] as InstalledModule[],
      experimental: { enforceModuleCompatibility: true },
      modulesDir: [modulesDir],
    },
    hook(name: string, fn: () => unknown) {
      hooks.set(name, [...(hooks.get(name) || []), fn])
      return () => {}
    },
    async callHook(name: string) {
      for (const fn of hooks.get(name) || [])
        await fn()
    },
  }
}

async function install(nuxt: ReturnType<typeof createNuxt>, installed: InstalledModule[] = [], enabled = true) {
  await NuxtSEO({ enabled, tips: true }, nuxt as unknown as Nuxt)
  nuxt.options._installedModules.push(...installed)
  await nuxt.callHook('modules:done')
}

describe('nuxt version', () => {
  it.each(['3.21.11', '4.0.3', '4.5.2'])('fails on unsupported Nuxt %s', async (version) => {
    await expect(install(createNuxt(version))).rejects.toThrow('incompatibility issues')
  })

  it.each(['4.6.0', '5.0.0'])('installs on Nuxt %s', async (version) => {
    await expect(install(createNuxt(version))).resolves.toBeUndefined()
  })
})

describe('loaded submodule version', () => {
  it.each([
    ['nuxt-ai-ready', '2.5.3', '3.0.0'],
    ['nuxt-skew-protection', '1.6.2', '2.0.0'],
  ])('rejects %s before its required major', async (name, oldVersion, fixedVersion) => {
    const nuxt = createNuxt('4.6.0', { [name]: oldVersion })
    await expect(install(nuxt, [{ meta: { name, version: fixedVersion } }]))
      .rejects
      .toThrow(`\`${name}\` version (\`${oldVersion}\`) does not satisfy \`>=${fixedVersion}\``)
  })
  it('checks custom module directories in the configured search order', async () => {
    const nuxt = createNuxt('4.6.0', { '@nuxtjs/sitemap': '9.0.0' }, 'custom_modules')
    const root = createNuxt('4.6.0', { '@nuxtjs/sitemap': '8.0.0' })
    nuxt.options.modulesDir.push(...root.options.modulesDir)
    await expect(install(nuxt, [{ meta: { name: '@nuxtjs/sitemap', version: '8.9.9' } }])).resolves.toBeUndefined()
  })

  it('uses installed metadata when the first resolved package has no version', async () => {
    const nuxt = createNuxt('4.6.0', { '@nuxtjs/sitemap': '9.0.0' }, 'custom_modules')
    const root = createNuxt('4.6.0', { '@nuxtjs/sitemap': '8.0.0' })
    writeFileSync(join(nuxt.options.modulesDir[0]!, '@nuxtjs/sitemap/package.json'), JSON.stringify({ name: '@nuxtjs/sitemap' }))
    nuxt.options.modulesDir.push(...root.options.modulesDir)
    await expect(install(nuxt, [{ meta: { name: '@nuxtjs/sitemap', version: '9.0.0' } }])).resolves.toBeUndefined()
  })

  it('skips missing custom directories and rejects malformed package metadata', async () => {
    const nuxt = createNuxt('4.6.0', { '@nuxtjs/sitemap': '9.0.0' }, 'custom_modules')
    nuxt.options.modulesDir.unshift(join(nuxt.options.modulesDir[0]!, 'missing'))
    writeFileSync(join(nuxt.options.modulesDir[1]!, '@nuxtjs/sitemap/package.json'), '{malformed')
    await expect(install(nuxt, [{ meta: { name: '@nuxtjs/sitemap', version: '9.0.0' } }])).rejects.toThrow(/JSON/)
  })

  it('fails when the copy the app loads is older than the requirement', async () => {
    const nuxt = createNuxt('4.6.0', { '@nuxtjs/sitemap': '7.3.1', '@nuxtjs/robots': '6.1.5' })
    await expect(install(nuxt, [
      { meta: { name: '@nuxtjs/sitemap', version: '7.3.0' } },
      { meta: { name: '@nuxtjs/robots', version: '6.1.5' } },
    ])).rejects.toThrow('`@nuxtjs/sitemap` version (`7.3.1`) does not satisfy `>=9.0.0`')
  })

  it('reads the package version, not a lagging module.json version', async () => {
    const nuxt = createNuxt('4.6.0', { '@nuxtjs/sitemap': '9.0.0' })
    await expect(install(nuxt, [
      { meta: { name: '@nuxtjs/sitemap', version: '8.9.9' } },
    ])).resolves.toBeUndefined()
  })

  it('falls back to the reported version when the app cannot resolve the package', async () => {
    await expect(install(createNuxt('4.6.0'), [
      { meta: { name: 'nuxt-schema-org', version: '4.9.0' } },
    ])).rejects.toThrow('`nuxt-schema-org` version (`4.9.0`) does not satisfy `>=7.0.0`')
  })

  it('checks optional modules only when the app installs them', async () => {
    await expect(install(createNuxt('4.6.0', { '@nuxtjs/i18n': '9.5.6' }), [
      { meta: { name: '@nuxtjs/i18n', version: '9.5.6' } },
    ])).rejects.toThrow('`@nuxtjs/i18n` version (`9.5.6`) does not satisfy `>=10.0`')
    await expect(install(createNuxt('4.6.0', { '@nuxtjs/i18n': '9.5.6' }))).resolves.toBeUndefined()
  })

  it('skips a disabled submodule', async () => {
    await expect(install(createNuxt('4.6.0', { 'nuxt-og-image': '6.4.0' }), [
      { meta: { name: 'nuxt-og-image', version: '6.4.0', disabled: true } },
    ])).resolves.toBeUndefined()
  })
})

describe('disabled', () => {
  it('skips the version checks with enabled: false', async () => {
    await expect(install(createNuxt('4.6.0'), [], false)).resolves.toBeUndefined()
    await expect(install(createNuxt('4.6.0', { '@nuxtjs/sitemap': '7.3.1' }), [
      { meta: { name: '@nuxtjs/sitemap', version: '7.3.1' } },
    ], false)).resolves.toBeUndefined()
  })
})

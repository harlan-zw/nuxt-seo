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
function createNuxt(version: string, packages: Record<string, string> = {}) {
  const modulesDir = join(mkdtempSync(join(tmpdir(), 'nuxt-seo-')), 'node_modules')
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
      experimental: {},
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
  await NuxtSEO({ enabled }, nuxt as unknown as Nuxt)
  nuxt.options._installedModules.push(...installed)
  await nuxt.callHook('modules:done')
}

describe('nuxt version', () => {
  it.each(['3.16.2', '3.18.1', '3.19.0', '3.21.11', '4.0.3'])('fails on unsupported Nuxt %s', async (version) => {
    await expect(install(createNuxt(version))).rejects.toThrow(`Nuxt ${version}`)
  })

  it.each(['4.1.0', '4.5.2', '5.0.0-alpha.1'])('installs on Nuxt %s', async (version) => {
    await expect(install(createNuxt(version))).resolves.toBeUndefined()
  })
})

describe('loaded submodule version', () => {
  it.each([
    ['nuxt-ai-ready', '2.5.2', '2.5.3'],
    ['nuxt-skew-protection', '1.6.1', '1.6.2'],
  ])('rejects %s before its required patch', async (name, oldVersion, fixedVersion) => {
    const nuxt = createNuxt('4.5.2', { [name]: oldVersion })
    await expect(install(nuxt, [
      { meta: { name, version: fixedVersion } },
    ])).rejects.toThrow(`\`${name}\` version (\`${oldVersion}\`) does not satisfy \`>=${fixedVersion}\``)
  })

  it('fails when the copy the app loads is older than the requirement', async () => {
    const nuxt = createNuxt('4.5.2', { '@nuxtjs/sitemap': '8.2.1', '@nuxtjs/robots': '6.1.5' })
    await expect(install(nuxt, [
      { meta: { name: '@nuxtjs/sitemap', version: '8.2.0' } },
      { meta: { name: '@nuxtjs/robots', version: '6.1.5' } },
    ])).rejects.toThrow('`@nuxtjs/sitemap` version (`8.2.1`) does not satisfy `>=8.3`')
  })

  it('reads the package version, not a lagging module.json version', async () => {
    const nuxt = createNuxt('4.5.2', { '@nuxtjs/sitemap': '8.3.0' })
    await expect(install(nuxt, [
      { meta: { name: '@nuxtjs/sitemap', version: '8.2.9' } },
    ])).resolves.toBeUndefined()
  })

  it('falls back to the reported version when the app cannot resolve the package', async () => {
    await expect(install(createNuxt('4.5.2'), [
      { meta: { name: 'nuxt-schema-org', version: '4.9.0' } },
    ])).rejects.toThrow('`nuxt-schema-org` version (`4.9.0`) does not satisfy `>=5.0`')
  })

  it('checks optional modules only when the app installs them', async () => {
    await expect(install(createNuxt('4.5.2', { '@nuxtjs/i18n': '9.5.6' }), [
      { meta: { name: '@nuxtjs/i18n', version: '9.5.6' } },
    ])).rejects.toThrow('`@nuxtjs/i18n` version (`9.5.6`) does not satisfy `>=10.0`')
    await expect(install(createNuxt('4.5.2', { '@nuxtjs/i18n': '9.5.6' }))).resolves.toBeUndefined()
  })

  it('skips a disabled submodule', async () => {
    await expect(install(createNuxt('4.5.2', { 'nuxt-og-image': '6.4.0' }), [
      { meta: { name: 'nuxt-og-image', version: '6.4.0', disabled: true } },
    ])).resolves.toBeUndefined()
  })
})

describe('disabled', () => {
  it('skips the version checks with enabled: false', async () => {
    await expect(install(createNuxt('4.0.3'), [], false)).resolves.toBeUndefined()
    await expect(install(createNuxt('4.5.2', { '@nuxtjs/sitemap': '7.3.1' }), [
      { meta: { name: '@nuxtjs/sitemap', version: '7.3.1' } },
    ], false)).resolves.toBeUndefined()
  })
})

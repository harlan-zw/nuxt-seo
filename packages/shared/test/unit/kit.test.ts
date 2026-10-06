import type { Nuxt } from '@nuxt/schema'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

import { join } from 'node:path'
import { getNitroVersion } from '@nuxt/kit'
import * as stdEnv from 'std-env'
import { describe, expect, it, vi } from 'vitest'
import { detectTarget, resolveNitroPreset, resolvePackageMajor, setupContentRuntime } from '../../src/kit'

// Mock std-env before importing kit
vi.mock('std-env', () => ({
  provider: '',
  env: {},
}))

// Mock @nuxt/kit to avoid Nuxt context dependency
vi.mock('@nuxt/kit', () => ({
  tryUseNuxt: () => null,
  useNuxt: () => { throw new Error('no nuxt context') },
  addTemplate: vi.fn(),
  createResolver: () => ({ resolve: (...args: string[]) => args.join('/') }),
  getNitroVersion: vi.fn(),
  hasNuxtModule: vi.fn(() => false),
  hasNuxtModuleCompatibility: vi.fn(() => false),
  loadNuxtModuleInstance: vi.fn(),
}))

function writePackage(root: string, id: string, version: string) {
  const packageDir = join(root, 'node_modules', ...id.split('/'))
  mkdirSync(packageDir, { recursive: true })
  writeFileSync(join(packageDir, 'index.js'), '')
  writeFileSync(join(packageDir, 'package.json'), JSON.stringify({ name: id, version, main: './index.js' }))
}

describe('setupContentRuntime', () => {
  it('inlines the content shim for Nitro 2', () => {
    vi.mocked(getNitroVersion).mockReturnValue(2)
    const nuxt = { options: { nitro: {} } } as Nuxt

    setupContentRuntime({ _tag: 'None' }, nuxt)

    expect(nuxt.options.nitro.externals?.inline).toContain('./runtime/content/')
  })

  it('leaves unsupported externals out of Nitro 3 config', () => {
    vi.mocked(getNitroVersion).mockReturnValue(3)
    const nuxt = { options: { nitro: {} } } as Nuxt

    setupContentRuntime({ _tag: 'None' }, nuxt)

    expect(nuxt.options.nitro.externals).toBeUndefined()
  })
})

// -------------------------------------------------------------------
// detectTarget
// -------------------------------------------------------------------
describe('detectTarget', () => {
  it('returns undefined when provider is empty', () => {
    vi.mocked(stdEnv).provider = '' as any
    expect(detectTarget()).toBeUndefined()
  })

  it('returns mapped provider for known non-static provider', () => {
    vi.mocked(stdEnv).provider = 'vercel' as any
    expect(detectTarget()).toBe('vercel')
  })

  it('returns static variant when static option is true', () => {
    vi.mocked(stdEnv).provider = 'vercel' as any
    expect(detectTarget({ static: true })).toBe('vercel-static')
  })

  it('returns static variant for netlify', () => {
    vi.mocked(stdEnv).provider = 'netlify' as any
    expect(detectTarget({ static: true })).toBe('netlify-static')
  })

  it('returns non-static variant for netlify by default', () => {
    vi.mocked(stdEnv).provider = 'netlify' as any
    expect(detectTarget()).toBe('netlify')
  })

  it('maps cloudflare_pages correctly', () => {
    vi.mocked(stdEnv).provider = 'cloudflare_pages' as any
    expect(detectTarget()).toBe('cloudflare-pages')
  })

  it('returns undefined for unknown provider', () => {
    vi.mocked(stdEnv).provider = 'unknown_provider' as any
    expect(detectTarget()).toBeUndefined()
  })

  it('returns undefined for static with no static mapping', () => {
    vi.mocked(stdEnv).provider = 'cloudflare_pages' as any
    expect(detectTarget({ static: true })).toBeUndefined()
  })
})

// -------------------------------------------------------------------
// resolveNitroPreset
// -------------------------------------------------------------------
describe('resolveNitroPreset', () => {
  it('returns stackblitz when provider is stackblitz', () => {
    vi.mocked(stdEnv).provider = 'stackblitz' as any
    expect(resolveNitroPreset()).toBe('stackblitz')
  })

  it('returns codesandbox when provider is codesandbox', () => {
    vi.mocked(stdEnv).provider = 'codesandbox' as any
    expect(resolveNitroPreset()).toBe('codesandbox')
  })

  it('uses preset from nitro config when provided', () => {
    vi.mocked(stdEnv).provider = '' as any
    expect(resolveNitroPreset({ preset: 'cloudflare' })).toBe('cloudflare')
  })

  it('normalizes underscores to hyphens', () => {
    vi.mocked(stdEnv).provider = '' as any
    expect(resolveNitroPreset({ preset: 'cloud_flare_pages' })).toBe('cloud-flare-pages')
  })

  it('falls back to node-server when no preset and no provider', () => {
    vi.mocked(stdEnv).provider = '' as any
    vi.mocked(stdEnv).env = {}
    expect(resolveNitroPreset({})).toBe('node-server')
  })

  it('reads NITRO_PRESET from env', () => {
    vi.mocked(stdEnv).provider = '' as any
    vi.mocked(stdEnv).env = { NITRO_PRESET: 'aws-lambda' }
    expect(resolveNitroPreset({})).toBe('aws-lambda')
    vi.mocked(stdEnv).env = {}
  })

  it('reads SERVER_PRESET from env', () => {
    vi.mocked(stdEnv).provider = '' as any
    vi.mocked(stdEnv).env = { SERVER_PRESET: 'deno' }
    expect(resolveNitroPreset({})).toBe('deno')
    vi.mocked(stdEnv).env = {}
  })

  it('prefers nitro config preset over env vars', () => {
    vi.mocked(stdEnv).provider = '' as any
    vi.mocked(stdEnv).env = { NITRO_PRESET: 'aws-lambda' }
    expect(resolveNitroPreset({ preset: 'cloudflare' })).toBe('cloudflare')
    vi.mocked(stdEnv).env = {}
  })
})

// -------------------------------------------------------------------
// resolvePackageMajor
// -------------------------------------------------------------------
describe('resolvePackageMajor', () => {
  it('reads a package version from the consuming project', async () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxtseo-shared-version-'))
    writePackage(root, '@example/module', '3.4.2')
    await expect(resolvePackageMajor('@example/module', root)).resolves.toBe(3)
  })

  it('returns undefined for a missing optional package', async () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxtseo-shared-missing-'))
    await expect(resolvePackageMajor('@example/missing', root)).resolves.toBeUndefined()
  })

  it('reads metadata when the package manifest is not exported', async () => {
    const root = mkdtempSync(join(tmpdir(), 'nuxtseo-shared-exports-'))
    writePackage(root, '@example/private-manifest', '5.0.0')
    writeFileSync(join(root, 'node_modules/@example/private-manifest/package.json'), JSON.stringify({
      name: '@example/private-manifest',
      version: '5.0.0',
      exports: { '.': './index.js' },
    }))
    await expect(resolvePackageMajor('@example/private-manifest', root)).resolves.toBe(5)
  })
})

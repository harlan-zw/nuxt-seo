import * as stdEnv from 'std-env'

import { describe, expect, it, vi } from 'vitest'
import { detectTarget, resolveNitroPreset } from '../../src/kit'

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
  hasNuxtModule: vi.fn(() => false),
  hasNuxtModuleCompatibility: vi.fn(() => false),
  loadNuxtModuleInstance: vi.fn(),
}))

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

import type { Nuxt } from 'nuxt/schema'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { expect, it, vi } from 'vitest'
import { setupDevToolsUI } from '../src/index'

const boundary = vi.hoisted(() => ({ rpc: undefined as undefined | { getInstalledSeoModules: () => { npm?: string, route: string, disabled?: boolean }[] }, disabled: true }))
vi.mock('@nuxt/devtools-kit', () => ({
  NUXT_DEVTOOLS_GROUP_ID: 'nuxt',
  onDevtoolsReady: vi.fn(),
  onDevToolsInitialized: (callback: (info: { version: string }) => void) => callback({ version: '4.0.0-beta.3' }),
  extendServerRpc: (_namespace: string, functions: typeof boundary.rpc) => { boundary.rpc = functions },
}))
vi.mock('nuxtseo-shared/kit', () => ({ detectNuxtSeoModules: () => [
  { name: 'nuxt-og-image', disabled: boundary.disabled },
  { name: 'nuxt-ai-ready', disabled: true },
] }))

it('reports disabled state for registered panels and installed modules without panels', () => {
  const rootDir = mkdtempSync(join(tmpdir(), 'seo-host-module-state-'))
  mkdirSync(join(rootDir, 'panel'), { recursive: true })
  writeFileSync(join(rootDir, 'panel/nuxt.config.ts'), 'export default defineNuxtConfig({})')
  const nuxt = { options: { dev: true, devtools: { enabled: true }, rootDir }, hook: vi.fn() } as unknown as Nuxt
  try {
    setupDevToolsUI({ name: 'nuxt-og-image', title: 'OG Image', icon: 'test', slug: 'og-image' }, () => join(rootDir, 'panel'), nuxt)
    const installed = boundary.rpc!.getInstalledSeoModules()
    expect(installed.find(module => module.npm === 'nuxt-og-image')).toEqual(expect.objectContaining({ route: '/__nuxt-seo-devtools/og-image', disabled: true }))
    expect(installed.find(module => module.npm === 'nuxt-ai-ready')).toEqual(expect.objectContaining({ route: '', disabled: true }))
    boundary.disabled = false
    expect(boundary.rpc!.getInstalledSeoModules().find(module => module.npm === 'nuxt-og-image')?.disabled).toBe(false)
  }
  finally {
    rmSync(rootDir, { recursive: true, force: true })
  }
})

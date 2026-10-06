import type { Nuxt } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import { detectNuxtSeoModules } from '../../src/kit'

describe('seo module detection', () => {
  it.each([
    ['nuxt-og-image', 'ogImage', false],
    ['nuxt-ai-ready', 'aiReady', { enabled: false }],
    ['nuxt-skew-protection', 'skewProtection', false],
  ])('keeps disabled %s visible without treating it as active', (name, key, config) => {
    const nuxt = { options: { _installedModules: [{ meta: { name } }], [key]: config } } as unknown as Nuxt
    expect(detectNuxtSeoModules(nuxt)).toEqual([expect.objectContaining({ name, disabled: true })])
  })

  it('keeps enabled default modules active', () => {
    const nuxt = { options: { _installedModules: [
      { meta: { name: 'nuxt-ai-ready' } },
      { meta: { name: 'nuxt-skew-protection' } },
    ] } } as unknown as Nuxt
    expect(detectNuxtSeoModules(nuxt)).toEqual([
      expect.objectContaining({ name: 'nuxt-ai-ready', disabled: false }),
      expect.objectContaining({ name: 'nuxt-skew-protection', disabled: false }),
    ])
  })
})

import type { Nuxt } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import NuxtSEO from '../../src/module'

function dependenciesFor(nuxtseo: unknown) {
  const nuxt = { options: nuxtseo === undefined ? {} : { nuxtseo } } as unknown as Nuxt
  return NuxtSEO.getModuleDependencies!(nuxt)
}

describe('nuxtseo config key', () => {
  it('installs the bundled modules by default', async () => {
    expect(Object.keys(await dependenciesFor(undefined) || {})).toContain('@nuxtjs/sitemap')
    expect(Object.keys(await dependenciesFor({}) || {})).toContain('@nuxtjs/sitemap')
  })

  it.each([false, { enabled: false }])('installs no bundled module with nuxtseo: %o', async (nuxtseo) => {
    expect(await dependenciesFor(nuxtseo)).toEqual({})
  })
})

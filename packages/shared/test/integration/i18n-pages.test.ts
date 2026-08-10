import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../fixtures/i18n-pages'),
  server: true,
})

describe('@nuxtjs/i18n partial pages', () => {
  it('uses the original resolved route for a missing default locale path', async () => {
    await expect($fetch('/catalog/42')).resolves.toContain('catalog')
    await expect($fetch('/fr/produits/42')).resolves.toContain('catalog')
  })

  it('inherits an explicit default locale path for a missing non-default locale', async () => {
    await expect($fetch('/company')).resolves.toContain('about')
    await expect($fetch('/fr/company')).resolves.toContain('about')
  })

  it('removes locales explicitly disabled with false', async () => {
    await expect($fetch('/disabled')).resolves.toContain('disabled')
    await expect($fetch('/fr/disabled')).rejects.toThrow()
  })

  it('leaves a route unlocalized when its entire pages entry is false', async () => {
    await expect($fetch('/unlocalized')).resolves.toContain('unlocalized')
    await expect($fetch('/fr/unlocalized')).rejects.toThrow()
    await expect($fetch('/unlocalized/child')).resolves.toContain('child')
    await expect($fetch('/fr/unlocalized/child')).rejects.toThrow()
  })
})

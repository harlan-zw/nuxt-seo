import { createResolver } from '@nuxt/kit'
import { $fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    modules: ['nuxt-skew-protection', 'nuxt-ai-ready'],
    site: {
      url: 'https://local.nuxtseo.com',
    },
    sitemap: {
      credits: false,
    },
  },
})

describe('standalone modules', () => {
  it('nuxt-skew-protection registers as installed module', () => {
    const ctx = useTestContext()
    const installedNames = ctx.nuxt!.options._installedModules.map(m => m.meta?.name)
    expect(installedNames).toContain('nuxt-skew-protection')
  })

  it('nuxt-ai-ready registers as installed module', () => {
    const ctx = useTestContext()
    const installedNames = ctx.nuxt!.options._installedModules.map(m => m.meta?.name)
    expect(installedNames).toContain('nuxt-ai-ready')
  })

  it('ai-ready serves llms.txt', async () => {
    const txt = await $fetch('/llms.txt') as string
    expect(txt).toContain('# ')
  })

  it('core modules still work alongside standalone modules', async () => {
    const robots = await $fetch('/robots.txt') as string
    expect(robots).toContain('User-agent')

    const sitemap = await $fetch('/sitemap.xml') as string
    expect(sitemap).toContain('<urlset')
  })
})

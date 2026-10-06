import { createResolver } from '@nuxt/kit'
import { $fetch, fetch, setup, useTestContext } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

process.env.NODE_ENV = 'production'

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    site: {
      url: 'https://local.nuxtseo.com',
    },
    sitemap: {
      credits: false,
    },
  },
})

describe('bundled modules', () => {
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

  it('ai-ready serves llms-full.txt with a markdown header', async () => {
    const res = await fetch('/llms-full.txt')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/plain')
    // Header is built from site config regardless of whether the DB has indexed
    // pages, so it's deterministic even when runtime indexing is unavailable.
    const txt = await res.text()
    expect(txt).toContain('# ')
    expect(txt).toContain('Canonical Origin: https://local.nuxtseo.com')
  })

  it('skew-protection serves its health endpoint with the build id', async () => {
    const health = await $fetch('/__skew/health') as { ok: boolean, version: string, uptime: number }
    expect(health.ok).toBe(true)
    expect(typeof health.version).toBe('string')
    expect(health.version.length).toBeGreaterThan(0)
    expect(typeof health.uptime).toBe('number')
  })

  it('serves documents without a skew-protection cookie', async () => {
    const res = await fetch('/', { headers: { 'sec-fetch-dest': 'document' } })
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie') || '').not.toContain('__nkpv')
  })

  it('does not open a live update endpoint by default', async () => {
    const res = await fetch('/__skew/sse')
    expect(res.status).toBe(404)
  })

  it('does not publish project instructions or an API catalog by default', async () => {
    expect((await fetch('/SKILL.md')).status).toBe(404)
    expect((await fetch('/.well-known/agent-skills/index.json')).status).toBe(404)
    expect((await fetch('/.well-known/api-catalog')).status).toBe(404)
  })

  it('serves markdown without a runtime database', async () => {
    const res = await fetch('/about.md')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/markdown')
    expect(await res.text()).toContain('about')
  })

  it('core modules still work alongside the new bundled modules', async () => {
    const robots = await $fetch('/robots.txt') as string
    expect(robots).toContain('User-agent')

    const sitemap = await $fetch('/sitemap.xml') as string
    expect(sitemap).toContain('<urlset')
  })
})

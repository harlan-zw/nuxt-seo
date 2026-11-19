import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { execaNode } from 'execa'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

await setup({ rootDir: resolve('../fixtures/content-valibot'), server: true })

describe('valibot content', () => {
  it('loads the public helpers with Zod imports blocked', async () => {
    await execaNode(resolve('../fixtures/content-valibot/check-no-zod.ts'))
  })

  it('renders the OG Image URL and Schema.org node from frontmatter', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<meta property="og:image" content="https://example.com/content-image.png">')
    expect(html).toMatch(/<script type="application\/ld\+json"[^>]*>[^<]*Valibot Author[^<]*<\/script>/)
  })

  it('renders the robots rule from frontmatter', async () => {
    const html = await $fetch<string>('/private')
    expect(html).toContain('<meta name="robots" content="noindex, nofollow">')
  })

  it('uses sitemap frontmatter and runs the collection callbacks', async () => {
    const xml = await $fetch<string>('/sitemap.xml')
    expect(xml).toMatch(/<loc>https:\/\/example.com\/featured<\/loc>\s*<lastmod>2025-10-01<\/lastmod>/)
    expect(xml).not.toContain('<loc>https://example.com/draft</loc>')
  })
})

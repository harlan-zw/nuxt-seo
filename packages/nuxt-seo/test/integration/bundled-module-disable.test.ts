import { createResolver } from '@nuxt/kit'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    aiReady: { enabled: false },
    skewProtection: false,
  },
})

describe('disabled bundled modules', () => {
  it('can disable both new modules through their own config keys', async () => {
    expect((await fetch('/llms.txt')).status).toBe(404)
    expect((await fetch('/about.md')).status).toBe(404)
    expect((await fetch('/__skew/health')).status).toBe(404)
    expect((await fetch('/sitemap.xml')).status).toBe(200)
  })
})

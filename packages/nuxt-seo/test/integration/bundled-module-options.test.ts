import { createResolver } from '@nuxt/kit'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../fixtures/basic'),
  server: true,
  nuxtConfig: {
    aiReady: false,
    skewProtection: {
      updateStrategy: 'sse',
      cookie: { name: 'site-build' },
    },
  },
})

describe('explicit site options', () => {
  it('can disable AI Ready while keeping the other bundled modules', async () => {
    expect((await fetch('/llms.txt')).status).toBe(404)
    expect((await fetch('/robots.txt')).status).toBe(200)
  })

  it('can opt into a version cookie', async () => {
    const res = await fetch('/', { headers: { 'sec-fetch-dest': 'document' } })
    expect(res.status).toBe(200)
    expect(res.headers.get('set-cookie')).toContain('site-build=')
  })

  it('can opt into live updates', async () => {
    const res = await fetch('/__skew/sse')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
    await res.body?.cancel()
  })
})

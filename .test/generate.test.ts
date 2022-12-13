import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { buildNuxt, createResolver, loadNuxt } from '@nuxt/kit'

describe('generate', () => {
  it('basic', async () => {
    process.env.NODE_ENV = 'production'
    process.env.prerender = true
    const { resolve } = createResolver(import.meta.url)
    const rootDir = resolve('../.playground')
    const nuxt = await loadNuxt({
      rootDir,
      overrides: {
        _generate: true,
      },
    })

    await buildNuxt(nuxt)

    const index = await readFile(resolve(rootDir, '.output/public/index.html'), 'utf-8')

    expect(index).toContain('link rel="canonical" href="https://harlanzw.com"')
    expect(index).toContain('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">')
    expect(index).toContain('<script type="application/ld+json" id="schema-org-graph">')

    // @todo snapshot testing
  }, 60000)
})

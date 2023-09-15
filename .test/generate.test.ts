import { describe, expect, it } from 'vitest'
import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../.playground'),
})

describe('generate', () => {
  it('basic', async () => {
    const index = await $fetch('/')
    // list meta tags with their contents
    const metaTags = index.match(/<meta.*?>/g) || []
    // we need to convert any urls with port to localhost, i.e "127.0.0.1:43889" becomes "localhost"
    metaTags.forEach((tag, i) => {
      metaTags[i] = tag.replace(/127\.0\.0\.1:\d+/g, 'localhost')
    })
    expect(metaTags).toMatchInlineSnapshot(`
      [
        "<meta charset=\\"utf-8\\">",
        "<meta name=\\"viewport\\" content=\\"width=device-width, initial-scale=1\\">",
        "<meta property=\\"og:type\\" content=\\"website\\">",
        "<meta name=\\"robots\\" content=\\"noindex, nofollow\\">",
        "<meta property=\\"og:title\\" content=\\"hello · .playground\\">",
        "<meta property=\\"og:url\\" content=\\"http://localhost/\\">",
        "<meta property=\\"og:locale\\" content=\\"en\\">",
        "<meta property=\\"og:site_name\\" content=\\".playground\\">",
      ]
    `)
  }, 60000)
})

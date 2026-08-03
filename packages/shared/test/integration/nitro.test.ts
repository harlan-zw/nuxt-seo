import { createResolver } from '@nuxt/kit'
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

const { resolve } = createResolver(import.meta.url)

await setup({
  rootDir: resolve('../fixtures/nitro-compat'),
  server: true,
})

describe('nitro runtime compatibility', () => {
  it('serves a runtime handler through the shared virtual imports', async () => {
    await expect($fetch('/api/compat')).resolves.toEqual({
      marker: 'nuxt-4',
    })
  })
})

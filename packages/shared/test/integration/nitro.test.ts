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
    await expect($fetch('/api/compat', {
      headers: {
        'x-nuxtseo-test': 'nuxt-4-forwarded',
      },
    })).resolves.toEqual({
      forwardedRequestHeader: 'nuxt-4-forwarded',
      marker: 'nuxt-4',
      requestContextMarker: 'nuxt-4-context',
    })
  })
})

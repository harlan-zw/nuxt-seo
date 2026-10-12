import { toMatchImageSnapshot } from 'jest-image-snapshot'
import { expect } from 'vitest'

// Production request handlers derive signing keys from this test-only secret.
process.env.NUXT_APP_SECRET = 'nuxt-seo-integration-test-secret-32-characters'

expect.extend({ toMatchImageSnapshot })

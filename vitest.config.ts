/// <reference types="vitest" />
/// <reference types="vitest/globals" />
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    watch: false,
  },
})

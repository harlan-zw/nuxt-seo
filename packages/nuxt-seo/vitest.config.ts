import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig, defineProject } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: 'dot',
    projects: [
      defineProject({
        test: {
          name: 'unit',
          environment: 'node',
          include: [
            './test/unit/**/*.test.ts',
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
      }),
      defineProject({
        test: {
          name: 'integration',
          environment: 'node',
          // Each file builds and starts a Nuxt fixture. Keep CI memory bounded.
          maxWorkers: 2,
          setupFiles: ['./test/setup.ts'],
          include: [
            './test/integration/**/*.test.ts',
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
      }),
      defineVitestProject({
        test: {
          name: 'e2e',
          include: [
            './test/e2e/**/*.test.ts',
          ],
          exclude: [
            '**/node_modules/**',
          ],
        },
      }),
    ],
  },
})

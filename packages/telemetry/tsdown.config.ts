import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [
    builder({
      externals: [
        'nuxtseo-shared',
        '@nuxt/schema',
        '@nuxt/kit',
        'nuxt',
        'ofetch',
        'pathe',
        'pkg-types',
        'rc9',
        'std-env',
      ],
    }),
  ],
})

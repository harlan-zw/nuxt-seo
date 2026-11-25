import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [
    builder({
      entries: [
        './src/const.ts',
        './src/content',
        './src/content-valibot',
      ],
      externals: [
        '@nuxt/content',
        'nitropack',
        'h3',
        'vue-router',
        '@vue/runtime-core',
        'std-env',
        'consola',
        'zod',
        'ofetch',
      ],
    }),
  ],
})

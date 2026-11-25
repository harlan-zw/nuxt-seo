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
        'nuxt',
        '@nuxt/kit',
        '@nuxt/schema',
        '@nuxt/content',
        'nitropack',
        'h3',
        'vue',
        'vue-router',
        '@vue/runtime-core',
        'std-env',
        'consola',
        'zod',
        'ofetch',
        '#imports',
        '#app',
      ],
    }),
  ],
})

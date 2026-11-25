import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [
    builder({
      entries: [
        './src/content',
        './src/content-runtime',
        './src/kit',
        './src/devtools',
        './src/i18n',
        './src/i18n-runtime',
        './src/pro',
        './src/utils',
        './src/const',
        './src/brand',
        './src/checklist',
        './src/server',
        './src/fetch',
        './src/prerender',
      ],
      externals: [
        'nitropack',
        'h3',
        '@nuxtjs/i18n',
        '@nuxt/content',
        '@harlan-zw/comark-content',
        '@nuxt/schema',
        '@nuxt/devtools-kit',
        '@nuxt/kit',
        '@clack/prompts',
        'nuxt',
        'nuxt-site-config',
        'vue',
        'zod',
        'consola',
        'defu',
        'ofetch',
        'pathe',
        'radix3',
        'sirv',
        'pkg-types',
        'std-env',
        'ufo',
      ],
    }),
  ],
})

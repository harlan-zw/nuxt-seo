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
        '@nuxt/devtools-kit',
        '@clack/prompts',
        'pathe',
        'sirv',
        'pkg-types',
      ],
    }),
  ],
})

import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  entries: [
    'src/const.ts',
    { input: 'src/content', name: 'content' },
  ],
  externals: [
    'nuxt',
    'nuxt/schema',
    '@nuxt/kit',
    '@nuxt/schema',
    '@nuxt/content',
    'nitropack',
    'nitropack/types',
    'h3',
    'vue',
    'vue-router',
    '@vue/runtime-core',
    'std-env',
    'consola',
    'consola/utils',
    'zod',
    'ofetch',
    '#imports',
    'nuxt/app',
    '#app',
  ],
})

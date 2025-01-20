import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  entries: [
    'src/const.ts',
    { input: 'src/content', name: 'content' },
  ],
  externals: [
    'h3',
    'std-env',
    'nitropack',
    'consola',
    '@nuxt/content',
    'zod',
    'ofetch',
    'consola/utils',
    'nuxt',
    'nuxt/app',
    '#app',
  ],
})

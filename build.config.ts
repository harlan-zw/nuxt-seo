import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/const.ts',
  ],
  externals: [
    'ofetch',
    'consola/utils',
    'nuxt',
    'nuxt/app',
    '#app',
  ],
})

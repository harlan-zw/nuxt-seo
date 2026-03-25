import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  failOnWarn: false,
  externals: [
    /^nuxtseo-shared/,
    /^@nuxt\/schema/,
    /^@nuxt\/kit/,
    /^nuxt/,
    /^node:/,
    /^ofetch/,
    /^pathe/,
    /^pkg-types/,
    /^rc9/,
    /^std-env/,
  ],
})

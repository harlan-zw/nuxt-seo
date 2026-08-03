import NitroCompatibilityFixture from './module.ts'

export default defineNuxtConfig({
  modules: [NitroCompatibilityFixture],
  runtimeConfig: {
    nitroCompatibilityMarker: 'nuxt-5',
  },
  compatibilityDate: '2026-06-10',
})

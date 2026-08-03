import NitroCompatibilityFixture from './module.ts'

export default defineNuxtConfig({
  modules: [NitroCompatibilityFixture],
  runtimeConfig: {
    nitroCompatibilityMarker: 'nuxt-4',
  },
  compatibilityDate: '2026-08-03',
})

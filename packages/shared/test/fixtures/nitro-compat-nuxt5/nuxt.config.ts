import NitroCompatibilityFixture from './module.ts'

export default defineNuxtConfig({
  future: { compatibilityVersion: process.env.NUXT_TEST_LANE === 'nuxt4' ? 4 : 5 },
  nitro: { prerender: { routes: ['/api/prerender-seed'] } },
  routeRules: { '/api/native-forwarded': { headers: { 'x-fixture-rule': 'native-rule' } } },
  modules: [NitroCompatibilityFixture],
  runtimeConfig: {
    nitroCompatibilityMarker: 'nuxt-5',
  },
  compatibilityDate: '2026-06-10',
})

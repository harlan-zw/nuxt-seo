import NitroCompatibilityFixture from './module.ts'

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,
  typescript: { appTsConfig: { exclude: ['../test.ts', '../module.ts'] } },
  vite: { resolve: { dedupe: ['nuxt', 'vue', 'vue-router'] } },
  nitro: { prerender: { routes: ['/api/prerender-seed'] } },
  routeRules: { '/api/native-forwarded': { headers: { 'x-fixture-rule': 'native-rule' } } },
  modules: [NitroCompatibilityFixture],
  runtimeConfig: {
    nitroCompatibilityMarker: 'nuxt-5',
  },
  compatibilityDate: '2026-06-10',
})

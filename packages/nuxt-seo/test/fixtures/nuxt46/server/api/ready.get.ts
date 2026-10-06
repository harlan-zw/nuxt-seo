import { defineEventHandler, useRuntimeConfig } from 'nuxt/server'

export default defineEventHandler(() => ({
  mode: useRuntimeConfig().fixtureMode,
  modules: useRuntimeConfig().fixtureModules,
}))

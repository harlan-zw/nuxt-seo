import { defineEventHandler, useRuntimeConfig } from 'nuxt/server'

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const skew = config.public.skewProtection
  return {
    mode: config.fixtureMode,
    modules: config.fixtureModules,
    skewCookie: skew && typeof skew === 'object' && 'cookie' in skew ? skew.cookie : undefined,
  }
})

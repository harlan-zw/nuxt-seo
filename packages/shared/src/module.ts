import type { ModuleRegistration } from './pro'
import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import { hookNuxtSeoProLicense, registerNuxtSeoProModule } from './pro'
import { hookNuxtSeoTelemetry } from './telemetry'

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-shared',
    configKey: 'nuxtSeoShared',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  setup() {
    hookNuxtSeoProLicense()
    hookNuxtSeoTelemetry()
  },
})

const PRO_MODULES = new Set([
  'nuxt-skew-protection',
  'nuxt-ai-ready',
])

/**
 * Register a Nuxt SEO module with the shared instance.
 * Pro modules are detected by name and also added to the pro registration list,
 * so there is no need to call `registerNuxtSeoProModule` separately.
 *
 * Call this from your module's setup().
 */
export function registerNuxtSeoModule(registration: ModuleRegistration): void {
  const nuxt = useNuxt()
  // @ts-expect-error untyped
  nuxt._nuxtSeoModules = nuxt._nuxtSeoModules || []
  // @ts-expect-error untyped
  nuxt._nuxtSeoModules.push(registration)

  if (PRO_MODULES.has(registration.name)) {
    registerNuxtSeoProModule(registration)
  }
}

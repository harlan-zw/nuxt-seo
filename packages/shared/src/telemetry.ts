import type { ModuleRegistration } from './pro'
import { createHash } from 'node:crypto'
import { useNuxt } from '@nuxt/kit'
import { $fetch } from 'ofetch'
import { detectPackageManager } from 'pkg-types'
import { provider as ciProvider, isCI, isTest } from 'std-env'

const TELEMETRY_ENDPOINT = 'https://nuxtseo.com/api/telemetry/collect'

/**
 * Hook into build to send telemetry. Call once from the shared module.
 * Reads from the existing _nuxtSeoModules registration list.
 * Only fires in CI, never in dev/test, fully fire-and-forget.
 *
 * Disable with NUXT_SEO_TELEMETRY_DISABLED=1
 */
export function hookNuxtSeoTelemetry(): void {
  const nuxt = useNuxt()

  // eslint-disable-next-line node/prefer-global/process
  if (!isCI || isTest || process.env.VITEST || process.env.NUXT_SEO_TELEMETRY_DISABLED) {
    return
  }

  // Only hook once
  // @ts-expect-error untyped
  if (nuxt._isNuxtSeoTelemetryHooked)
    return
  // @ts-expect-error untyped
  nuxt._isNuxtSeoTelemetryHooked = true

  nuxt.hooks.hook('build:done', async () => {
    // @ts-expect-error untyped
    const modules: ModuleRegistration[] = nuxt._nuxtSeoModules || []
    if (modules.length === 0)
      return

    const projectHash = createHash('sha256')
      .update(nuxt.options.rootDir)
      .digest('hex')
      .slice(0, 16)

    const config: Record<string, Record<string, boolean | number>> = {}
    for (const mod of modules) {
      if (!mod.features)
        continue
      const safe: Record<string, boolean | number> = {}
      for (const [k, v] of Object.entries(mod.features)) {
        if (typeof v === 'boolean' || typeof v === 'number') {
          safe[k] = v
        }
      }
      if (Object.keys(safe).length > 0) {
        config[mod.name] = safe
      }
    }

    const payload = {
      projectHash,
      modules: modules.map(m => m.name),
      moduleVersions: Object.fromEntries(
        modules.filter(m => m.version).map(m => [m.name, m.version!]),
      ),
      config: Object.keys(config).length > 0 ? config : undefined,
      nuxtVersion: nuxt._version,
      // eslint-disable-next-line node/prefer-global/process
      nodeVersion: process.version,
      // eslint-disable-next-line node/prefer-global/process
      os: process.platform,
      packageManager: await detectPackageManager(nuxt.options.rootDir).then(r => r?.name).catch(() => undefined),
      ci: ciProvider || 'true',
    }

    $fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      body: payload,
      timeout: 5000,
    }).catch(() => {})
  })
}

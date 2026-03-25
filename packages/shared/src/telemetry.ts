import type { NuxtSeoModuleDetection } from './kit'
import { createHash } from 'node:crypto'
import { useNuxt } from '@nuxt/kit'
import { $fetch } from 'ofetch'
import { basename } from 'pathe'
import { resolveLockfile } from 'pkg-types'
import { provider as ciProvider, isCI, isTest } from 'std-env'
import { detectNuxtSeoModules } from './kit'

const TELEMETRY_ENDPOINT = 'https://nuxtseo.com/api/telemetry/collect'

/**
 * Hook into build to send telemetry. Call once from the shared module.
 * Auto-detects installed Nuxt SEO modules from `_installedModules`.
 * Modules can optionally report features via the `nuxt-seo:features` hook.
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
    const modules: NuxtSeoModuleDetection[] = detectNuxtSeoModules(nuxt)
    if (modules.length === 0)
      return

    // Let modules optionally report feature flags
    // @ts-expect-error untyped hook
    await nuxt.callHook('nuxt-seo:features', modules)

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
      packageManager: await resolveLockfile(nuxt.options.rootDir)
        .then((lockfile) => {
          const name = basename(lockfile)
          if (name === 'pnpm-lock.yaml') return 'pnpm'
          if (name === 'yarn.lock') return 'yarn'
          if (name === 'bun.lock' || name === 'bun.lockb') return 'bun'
          if (name === 'package-lock.json') return 'npm'
          return undefined
        })
        .catch(() => undefined),
      ci: ciProvider || 'true',
    }

    $fetch(TELEMETRY_ENDPOINT, {
      method: 'POST',
      body: payload,
      timeout: 5000,
    }).catch(() => {})
  })
}

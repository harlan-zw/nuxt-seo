import type { Nuxt } from '@nuxt/schema'
import type { NuxtSeoModuleDetection } from 'nuxtseo-shared/kit'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { defineNuxtModule, useNuxt } from '@nuxt/kit'
import { detectNuxtSeoModules } from 'nuxtseo-shared/kit'
import { $fetch } from 'ofetch'
import { basename } from 'pathe'
import { resolveLockfile } from 'pkg-types'
import { readUser } from 'rc9'
import { provider as ciProvider, isCI, isMinimal, isTest } from 'std-env'

const TELEMETRY_ENDPOINT = 'https://nuxtseo.com/api/telemetry/collect'

function isDocker(): boolean {
  try {
    statSync('/.dockerenv')
    return true
  }
  catch {}
  try {
    if (readFileSync('/proc/self/cgroup', 'utf8').includes('docker'))
      return true
  }
  catch {}
  try {
    if (readFileSync('/proc/self/mountinfo', 'utf8').includes('/docker/containers/'))
      return true
  }
  catch {}
  return false
}

/**
 * Resolve whether telemetry is enabled using a cascading check.
 *
 * Priority (first match wins):
 * 1. NUXT_SEO_TELEMETRY_DISABLED env var → disabled
 * 2. Test environment → disabled
 * 3. nuxtSeo.telemetry config in nuxt.config → explicit enable/disable
 * 4. nuxtSeo.telemetry.enabled in ~/.nuxtrc → enable/disable
 * 5. Non-CI, Docker, minimal, CodeSandbox → disabled
 * 6. CI with no opt-out → enabled
 */
function resolveEnabled(nuxt: Nuxt): boolean {
  // eslint-disable-next-line node/prefer-global/process
  if (process.env.NUXT_SEO_TELEMETRY_DISABLED)
    return false

  // eslint-disable-next-line node/prefer-global/process
  if (isTest || process.env.VITEST)
    return false

  // nuxt.config: nuxtSeo.telemetry or nuxtseo.telemetry
  const configTelemetry = (nuxt.options as any).nuxtSeo?.telemetry
    ?? (nuxt.options as any).nuxtseo?.telemetry
  if (configTelemetry === false)
    return false
  if (configTelemetry === true)
    return true

  // ~/.nuxtrc: nuxtSeo.telemetry.enabled
  const rc = readUser('.nuxtrc') as Record<string, any>
  const rcEnabled = rc?.nuxtSeo?.telemetry?.enabled
  if (rcEnabled === false)
    return false
  if (rcEnabled === true)
    return true

  // Non-interactive environments without explicit opt-in
  // eslint-disable-next-line node/prefer-global/process
  if (!isCI || isMinimal || isDocker() || process.env.CODESANDBOX_SSE)
    return false

  // CI with no opt-out: enabled by default
  return true
}

export default defineNuxtModule({
  meta: {
    name: 'nuxtseo-telemetry',
    configKey: 'nuxtSeoTelemetry',
    compatibility: {
      nuxt: '>=3.16.0',
    },
  },
  setup() {
    const nuxt = useNuxt()

    if (!resolveEnabled(nuxt))
      return

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
            if (name === 'pnpm-lock.yaml')
              return 'pnpm'
            if (name === 'yarn.lock')
              return 'yarn'
            if (name === 'bun.lock' || name === 'bun.lockb')
              return 'bun'
            if (name === 'package-lock.json')
              return 'npm'
            return undefined
          })
          .catch(() => undefined),
        ci: ciProvider || (isCI ? 'true' : undefined),
      }

      $fetch(TELEMETRY_ENDPOINT, {
        method: 'POST',
        body: payload,
        timeout: 5000,
      }).catch(() => {})
    })
  },
})

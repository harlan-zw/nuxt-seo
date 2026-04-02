import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

export interface ModuleUpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
}

const LEADING_V_RE = /^v/
const PRERELEASE_RE = /[-+].*$/

function parseSemver(version: string): [number, number, number] {
  // Strip leading v, then strip pre-release/build metadata (e.g. 1.2.3-rc.1+build)
  const clean = version.replace(LEADING_V_RE, '').replace(PRERELEASE_RE, '')
  const parts = clean.split('.').map(Number)
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
}

function isNewerVersion(latest: string, current: string): boolean {
  const [lMajor, lMinor, lPatch] = parseSemver(latest)
  const [cMajor, cMinor, cPatch] = parseSemver(current)
  if (lMajor !== cMajor)
    return lMajor > cMajor
  if (lMinor !== cMinor)
    return lMinor > cMinor
  return lPatch > cPatch
}

const updateCache = ref<Record<string, ModuleUpdateInfo>>({})

export function useModuleUpdate(npmPackage: string | undefined, currentVersion: string | undefined): { hasUpdate: ComputedRef<boolean>, latestVersion: ComputedRef<string | undefined>, info: ComputedRef<ModuleUpdateInfo | undefined> } {
  const cacheKey = npmPackage && currentVersion ? `${npmPackage}@${currentVersion}` : undefined

  const info = computed(() => {
    if (!cacheKey)
      return undefined
    return updateCache.value[cacheKey]
  })

  const hasUpdate = computed(() => info.value?.hasUpdate ?? false)
  const latestVersion = computed(() => info.value?.latestVersion)

  if (cacheKey && !updateCache.value[cacheKey]) {
    fetch(`https://registry.npmjs.org/${npmPackage}/latest`)
      .then(r => r.json())
      .then((data) => {
        const latest = data.version as string
        if (!latest)
          return
        updateCache.value[cacheKey] = {
          currentVersion: currentVersion!,
          latestVersion: latest,
          hasUpdate: isNewerVersion(latest, currentVersion!),
        }
      })
      .catch(() => {})
  }

  return { hasUpdate, latestVersion, info }
}

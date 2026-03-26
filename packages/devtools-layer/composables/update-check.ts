import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

export interface ModuleUpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
}

function parseSemver(version: string): [number, number, number] {
  // eslint-disable-next-line e18e/prefer-static-regex
  const parts = version.replace(/^v/, '').split('.').map(Number)
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
  const info = computed(() => {
    if (!npmPackage || !currentVersion)
      return undefined
    return updateCache.value[npmPackage]
  })

  const hasUpdate = computed(() => info.value?.hasUpdate ?? false)
  const latestVersion = computed(() => info.value?.latestVersion)

  if (npmPackage && currentVersion && !updateCache.value[npmPackage]) {
    fetch(`https://registry.npmjs.org/${npmPackage}/latest`)
      .then(r => r.json())
      .then((data) => {
        const latest = data.version as string
        if (!latest)
          return
        updateCache.value[npmPackage] = {
          currentVersion,
          latestVersion: latest,
          hasUpdate: isNewerVersion(latest, currentVersion),
        }
      })
      .catch(() => {})
  }

  return { hasUpdate, latestVersion, info }
}

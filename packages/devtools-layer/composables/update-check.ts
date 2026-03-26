import type { ComputedRef } from 'vue'
import { computed, ref } from 'vue'

export interface ModuleUpdateInfo {
  currentVersion: string
  latestVersion: string
  hasUpdate: boolean
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
          hasUpdate: latest !== currentVersion,
        }
      })
      .catch(() => {})
  }

  return { hasUpdate, latestVersion, info }
}

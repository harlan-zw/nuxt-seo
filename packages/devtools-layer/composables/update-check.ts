import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue, watch } from 'vue'

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

export function useModuleUpdate(npmPackage: MaybeRefOrGetter<string | undefined>, currentVersion: MaybeRefOrGetter<string | undefined>): { hasUpdate: ComputedRef<boolean>, latestVersion: ComputedRef<string | undefined>, info: ComputedRef<ModuleUpdateInfo | undefined> } {
  // npmPackage/currentVersion are reactive: the version arrives asynchronously from the
  // host debug data, so resolve them in a watcher rather than reading a setup-time snapshot
  // (the previous bug — the check ran against an empty version and never updated).
  const cacheKey = computed(() => {
    const pkg = toValue(npmPackage)
    const ver = toValue(currentVersion)
    return pkg && ver ? `${pkg}@${ver}` : undefined
  })

  const info = computed(() => (cacheKey.value ? updateCache.value[cacheKey.value] : undefined))
  const hasUpdate = computed(() => info.value?.hasUpdate ?? false)
  const latestVersion = computed(() => info.value?.latestVersion)

  watch(cacheKey, (key) => {
    const pkg = toValue(npmPackage)
    const ver = toValue(currentVersion)
    if (!key || !pkg || !ver || updateCache.value[key])
      return
    fetch(`https://registry.npmjs.org/${pkg}/latest`)
      .then(r => r.json())
      .then((data) => {
        const latest = data.version as string
        if (!latest)
          return
        updateCache.value[key] = {
          currentVersion: ver,
          latestVersion: latest,
          hasUpdate: isNewerVersion(latest, ver),
        }
      })
      .catch(() => {
        // Registry checks are advisory; a failed request means no update badge.
        return undefined
      })
  }, { immediate: true })

  return { hasUpdate, latestVersion, info }
}

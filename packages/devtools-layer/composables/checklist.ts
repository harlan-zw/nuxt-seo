import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import {
  DEBUG_ENDPOINTS,
  DEVTOOLS_NAME_TO_SLUG,
  evaluateSetupChecklist,
  parseSetupChecklistContext,
} from 'nuxtseo-shared/checklist'
import { modules as seoModules } from 'nuxtseo-shared/const'
import { withBase } from 'ufo'
import { computed, ref, toValue, watch } from 'vue'
import { installedModules } from './modules'
import { appFetch } from './rpc'
import { base } from './state'

export type { ChecklistItemResult, ChecklistSummary, ModuleChecklistResult } from 'nuxtseo-shared/checklist'

const debugCache = ref<Map<NuxtSEOModule['slug'], Record<string, any>>>(new Map())
const loading = ref(false)
const evaluated = ref(false)
const setupMetadata = ref<ReturnType<typeof parseSetupMetadata>>()

function parseSetupMetadata(value: unknown) {
  if (!value || typeof value !== 'object')
    return
  const data = value as Record<string, any>
  const context = parseSetupChecklistContext(data.context)
  if (!context)
    return
  const validSlugs = (value: unknown): value is NuxtSEOModule['slug'][] => Array.isArray(value) && value.every(slug => seoModules.some(module => module.slug === slug))
  if (!validSlugs(data.installedModuleSlugs) || !validSlugs(data.disabledModuleSlugs))
    return
  return { context, installedModuleSlugs: new Set(data.installedModuleSlugs), disabledModuleSlugs: new Set(data.disabledModuleSlugs) }
}

function getInstalledSlugs() {
  const installedModuleSlugs = new Set<NuxtSEOModule['slug']>()
  const disabledModuleSlugs = new Set<NuxtSEOModule['slug']>()
  for (const mod of toValue(installedModules)) {
    const slug = seoModules.find(m => m.npm === mod.npm)?.slug || DEVTOOLS_NAME_TO_SLUG[mod.name]
    if (!slug || slug === 'nuxt-seo')
      continue
    installedModuleSlugs.add(slug)
    if (mod.disabled)
      disabledModuleSlugs.add(slug)
  }
  return { installedModuleSlugs, disabledModuleSlugs }
}

async function fetchDebugData(): Promise<boolean> {
  const fetch = toValue(appFetch)
  if (!fetch)
    return false

  const metadata = await fetch(withBase('/__nuxt-seo__/setup.json', toValue(base)), { timeout: 3000, retry: 0 }).catch((error) => {
    // Standalone modules do not register the optional meta-module endpoint.
    if (error?.statusCode !== 404 && error?.status !== 404)
      console.warn('[nuxt-seo] setup context could not be loaded:', error)
    return undefined
  })
  setupMetadata.value = parseSetupMetadata(metadata)
  const { installedModuleSlugs, disabledModuleSlugs } = setupMetadata.value || getInstalledSlugs()
  const cache = new Map<NuxtSEOModule['slug'], Record<string, any>>()
  await Promise.all(Object.entries(DEBUG_ENDPOINTS)
    .filter(([slug]) => installedModuleSlugs.has(slug as NuxtSEOModule['slug']) && !disabledModuleSlugs.has(slug as NuxtSEOModule['slug']))
    .map(async ([slug, endpoint]) => {
      const data = await fetch(withBase(endpoint!, toValue(base)), { timeout: 3000, retry: 0 }).catch((error) => {
        console.warn(`[nuxt-seo] failed to load checklist data from "${endpoint}":`, error)
        return undefined
      })
      if (data && typeof data === 'object' && !Array.isArray(data))
        cache.set(slug as NuxtSEOModule['slug'], data)
    }))
  debugCache.value = cache
  return true
}

const results = computed(() => evaluateSetupChecklist({ ...(setupMetadata.value || getInstalledSlugs()), debugData: debugCache.value }))
const summary = computed(() => {
  let total = 0
  let passed = 0
  let requiredPending = 0
  let recommendedPending = 0
  let unavailable = 0
  for (const result of results.value) {
    total += result.items.filter(item => item.level === 'required' && item.status !== 'not-applicable').length
    passed += result.items.filter(item => item.level === 'required' && item.status === 'passed').length
    requiredPending += result.requiredPending
    recommendedPending += result.recommendedPending
    unavailable += result.items.filter(item => item.level === 'required' && item.status === 'unavailable').length
  }
  return { total, passed, requiredPending, recommendedPending, unavailable }
})

export function getModuleResult(slug: string) {
  return results.value.find(result => result.moduleSlug === slug)
}

export function getModuleResultByName(devtoolsName: string) {
  return getModuleResult(DEVTOOLS_NAME_TO_SLUG[devtoolsName] || devtoolsName)
}

export async function evaluate(): Promise<void> {
  if (loading.value)
    return
  loading.value = true
  try {
    evaluated.value = await fetchDebugData()
  }
  finally {
    loading.value = false
  }
}

watch([appFetch, installedModules], () => {
  if (toValue(appFetch) && toValue(installedModules).length)
    void evaluate().catch(error => console.warn('[nuxt-seo] setup checks could not complete:', error))
})

export function getSetupChecklist() {
  return { results, summary, loading, evaluated, evaluate, getModuleResult, getModuleResultByName }
}

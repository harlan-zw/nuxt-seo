import type { ModuleChecklistResult } from 'nuxtseo-shared/checklist'
import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import { DEBUG_ENDPOINTS, formatSetupReport } from 'nuxtseo-shared/checklist'

type ModuleSlug = NuxtSEOModule['slug']

/** Required settings bypass the tips cooldown. Healthy apps stay quiet without eligible tips. */
export async function reportSetupChecklist(results: ModuleChecklistResult[], dependencies: {
  allowTips: () => Promise<boolean>
  warn: (message: string) => void
  info: (message: string) => void
}): Promise<void> {
  const requiredMissing = results.some(result => result.requiredPending > 0)
  const showTips = results.some(result => result.recommendedPending > 0) && await dependencies.allowTips()
  if (!requiredMissing && !showTips)
    return
  const report = formatSetupReport(results, { showTips })
  if (requiredMissing)
    dependencies.warn(report)
  else
    dependencies.info(report)
}

export interface HomepageResponse {
  path: string
  status: number
  contentType: string
}

/** Start in the background once. Never add a promise to the page response. */
export function createHomepageSetupCheck<T extends HomepageResponse>(baseURL: string, run: (response: T) => Promise<void>, reportFailure: (cause: unknown) => void, homepagePaths: string[] = [baseURL]): (response: T) => void {
  let started = false
  const homes = new Set(homepagePaths.map(path => path.replace(/\/$/, '') || '/'))
  return (response) => {
    const path = response.path.split('?')[0]!.replace(/\/$/, '') || '/'
    if (started || !homes.has(path) || response.status < 200 || response.status >= 300 || !response.contentType.toLowerCase().includes('text/html'))
      return
    started = true
    void run(response).catch(reportFailure)
  }
}

export async function collectSetupDebugData(options: {
  installedModuleSlugs: Set<ModuleSlug>
  disabledModuleSlugs?: Set<ModuleSlug>
  baseURL: string
  fetch: (path: string, signal: AbortSignal) => Promise<unknown>
  timeout?: number
}): Promise<Map<ModuleSlug, Record<string, any>>> {
  const data = new Map<ModuleSlug, Record<string, any>>()
  await Promise.all(Object.entries(DEBUG_ENDPOINTS).map(async ([slug, endpoint]) => {
    if (!options.installedModuleSlugs.has(slug as ModuleSlug) || options.disabledModuleSlugs?.has(slug as ModuleSlug))
      return
    const controller = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        controller.abort()
        reject(new Error('Setup check timed out'))
      }, options.timeout ?? 3000)
    })
    const path = `${options.baseURL.replace(/\/$/, '')}${endpoint}`
    // An unavailable endpoint becomes an explicit unavailable checklist result.
    await Promise.race([Promise.resolve().then(() => options.fetch(path, controller.signal)), timeout])
      .then((value) => {
        if (value && typeof value === 'object' && !Array.isArray(value))
          data.set(slug as ModuleSlug, value as Record<string, any>)
      })
      .catch(() => {
        // Missing data is reported as unavailable, never as configured or missing setup.
      })
      .finally(() => clearTimeout(timer))
  }))
  return data
}

import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import type { HomepageResponse } from '../utils/setup'
import { evaluateSetupChecklist } from 'nuxtseo-shared/checklist'
import { createModuleLogger } from 'nuxtseo-shared/utils'
import setup from '#nuxt-seo/setup.mjs'
import { getRequestURL, getResponseHeader } from '#nuxtseo/h3'
import { defineNitroPlugin, fetchWithEvent } from '#nuxtseo/nitro'
import { getSiteConfig } from '#site-config/server'
import { collectSetupDebugData, createHomepageSetupCheck, reportSetupChecklist } from '../utils/setup'
import { claimSetupTips } from '../utils/setup-report'

type SetupEvent = Parameters<typeof fetchWithEvent>[0]
interface Nitro3ResponseHooks {
  hook: (name: 'response', callback: (response: Response, event: SetupEvent) => void) => void
}

export default defineNitroPlugin((nitroApp) => {
  const logger = createModuleLogger('Nuxt SEO')
  const check = createHomepageSetupCheck(setup.baseURL, async ({ event }: HomepageResponse & { event: Parameters<typeof fetchWithEvent>[0] }) => {
    const installedModuleSlugs = new Set<NuxtSEOModule['slug']>(setup.installedModuleSlugs)
    const disabledModuleSlugs = new Set<NuxtSEOModule['slug']>(setup.disabledModuleSlugs)
    const siteConfig = { ...getSiteConfig(event, { debug: true }) }
    const debugData = await collectSetupDebugData({
      installedModuleSlugs,
      disabledModuleSlugs,
      baseURL: setup.baseURL,
      fetch: (path, signal) => fetchWithEvent(event, path, { signal }),
    })
    // Homepage route rules and request-time updates can differ from debug routes.
    debugData.set('site-config', { ...debugData.get('site-config'), config: siteConfig })
    if (debugData.has('sitemap'))
      debugData.get('sitemap')!.siteConfig = siteConfig
    const results = evaluateSetupChecklist({ installedModuleSlugs, disabledModuleSlugs, debugData, context: setup.context })
    await reportSetupChecklist(results, {
      // Optional tips stay quiet when storage is unavailable. Required warnings remain visible.
      allowTips: async () => (await claimSetupTips({ stateDirectory: setup.stateDirectory }))._tag === 'Allowed',
      warn: message => logger.warn(message),
      info: message => logger.info(message),
    })
  }, (cause) => {
    logger.warn('Setup checks could not complete:', cause)
  }, setup.homepagePaths)
  if (setup.nitroBuilder === 'nitro-v3') {
    // Nitro 3's native response hook observes the final status and request context.
    // The source checkout uses Nitro 2 types, so narrow only this public hook boundary.
    const hooks = nitroApp.hooks as unknown as Nitro3ResponseHooks
    hooks.hook('response', (response, event) => {
      check({ event, path: getRequestURL(event).pathname, status: response.status, contentType: response.headers.get('content-type') || '' })
    })
  }
  else {
    nitroApp.hooks.hook('render:response', (response, { event }) => {
      const headers = response.headers
      const contentType = headers
        ? headers instanceof Headers ? headers.get('content-type') : headers['content-type']
        : getResponseHeader(event, 'content-type')
      check({ event, path: getRequestURL(event).pathname, status: response.statusCode || 200, contentType: typeof contentType === 'string' ? contentType : '' })
    })
  }
})

import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import type { HomepageResponse } from '../utils/setup'
import { evaluateSetupChecklist, formatSetupReport } from 'nuxtseo-shared/checklist'
import { createModuleLogger } from 'nuxtseo-shared/utils'
import setup from '#nuxt-seo/setup.mjs'
import { getRequestURL } from '#nuxtseo/h3'
import { defineNitroPlugin, fetchWithEvent } from '#nuxtseo/nitro'
import { getSiteConfig } from '#site-config/server/composables/getSiteConfig'
import { collectSetupDebugData, createHomepageSetupCheck } from '../utils/setup'

export default defineNitroPlugin((nitroApp) => {
  const logger = createModuleLogger('Nuxt SEO')
  const check = createHomepageSetupCheck(setup.baseURL, async ({ event }: HomepageResponse & { event: Parameters<typeof getSiteConfig>[0] }) => {
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
    const report = formatSetupReport(results)
    if (results.some(result => result.requiredPending > 0))
      logger.warn(report)
    else
      logger.info(report)
  }, (cause) => {
    logger.warn('Setup checks could not complete:', cause)
  }, setup.homepagePaths)
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const headers = response.headers
    const contentType = headers instanceof Headers ? headers.get('content-type') : headers?.['content-type']
    check({ event, path: getRequestURL(event).pathname, status: response.statusCode || 200, contentType: contentType || '' })
  })
})

import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { getGscdumpCredentials } from '../../utils/gscdump'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const proKeyConfigured = !!config.seoProKey

  let siteUrl = ''
  try {
    const { getSiteConfig } = await import('#site-config/server/composables')
    const siteConfig = getSiteConfig(event as any)
    siteUrl = siteConfig?.url || ''
  }
  catch {
    // site-config may not be available
  }

  let connected = false
  let gscdumpSiteId: string | null = null
  if (proKeyConfigured && siteUrl) {
    const creds = await getGscdumpCredentials(event).catch(() => null)
    connected = !!creds?.gscdumpSiteId
    gscdumpSiteId = creds?.gscdumpSiteId || null
  }

  return {
    version: '0.1.0',
    siteUrl,
    proKeyConfigured,
    connected,
    gscdumpSiteId,
  }
})

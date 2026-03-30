import type { H3Event } from 'h3'
import { $fetch } from 'ofetch'

export interface GscdumpCredentials {
  gscdumpApiKey: string
  gscdumpUserId: string
  gscdumpSiteId: string | null
  siteUrl: string
}

// Cache credentials for the dev server session with TTL
let cachedCredentials: GscdumpCredentials | null = null
let cachedAt = 0
let credentialsFetchPromise: Promise<GscdumpCredentials> | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

export async function getGscdumpCredentials(event: H3Event): Promise<GscdumpCredentials> {
  if (cachedCredentials && (Date.now() - cachedAt) < CACHE_TTL_MS)
    return cachedCredentials

  // Deduplicate concurrent requests
  if (credentialsFetchPromise)
    return credentialsFetchPromise

  const config = useRuntimeConfig(event)
  const proKey = config.seoProKey as string
  if (!proKey)
    throw createError({ statusCode: 500, message: 'seoProKey not configured' })

  // Get siteUrl from site-config
  let siteUrl = ''
  try {
    const { getSiteConfig } = await import('#site-config/server/composables')
    const siteConfig = getSiteConfig(event as any)
    siteUrl = siteConfig?.url || ''
  }
  catch {
    // site-config may not be available
  }

  if (!siteUrl)
    throw createError({ statusCode: 500, message: 'Site URL not configured. Set site.url in nuxt.config or install nuxt-site-config.' })

  credentialsFetchPromise = $fetch<GscdumpCredentials>('https://nuxtseo.com/api/pro/devtools/credentials', {
    headers: { 'x-api-key': proKey },
    query: { siteUrl },
  }).then((creds) => {
    cachedCredentials = creds
    cachedAt = Date.now()
    return creds
  }).catch((err) => {
    cachedCredentials = null
    cachedAt = 0
    throw createError({
      statusCode: err.statusCode || 502,
      message: err.data?.message || err.message || 'Failed to fetch gscdump credentials',
    })
  }).finally(() => {
    credentialsFetchPromise = null
  })

  return credentialsFetchPromise
}

export function clearCredentialsCache() {
  cachedCredentials = null
  cachedAt = 0
}

const GSCDUMP_API_URL = 'https://gscdump.com/api'

export async function fetchGscdump<T>(event: H3Event, path: string, query?: Record<string, string>): Promise<T> {
  const creds = await getGscdumpCredentials(event)
  if (!creds.gscdumpSiteId)
    throw createError({ statusCode: 404, message: 'Site not connected to GSC. Connect Google Search Console in your Pro dashboard.' })

  const url = `${GSCDUMP_API_URL}${path.replace(':siteId', creds.gscdumpSiteId)}`
  return $fetch<T>(url, {
    headers: { 'x-api-key': creds.gscdumpApiKey },
    query,
  }).catch((err) => {
    // Clear stale credentials on auth errors and let next request retry
    if (err.statusCode === 401 || err.statusCode === 403)
      clearCredentialsCache()
    throw err
  })
}

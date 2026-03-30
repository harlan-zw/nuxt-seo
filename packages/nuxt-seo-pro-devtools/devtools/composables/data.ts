import type { DebugResponse, GscdumpDataDetailResponse, GscdumpDataResponse, SyncStatusResponse } from './types'
import { computed, refreshNuxtData, useAsyncData, watch } from '#imports'
import { appFetch } from 'nuxtseo-layer-devtools/composables/rpc'
import { path, productionUrl, refreshTime } from 'nuxtseo-layer-devtools/composables/state'

// Debug data
const { data: debugData, status: debugStatus } = useAsyncData<DebugResponse | null>('debug', () => {
  if (!appFetch.value)
    return Promise.resolve(null)
  return appFetch.value<DebugResponse>('/__seo-pro-devtools/debug').catch(() => null)
}, { watch: [refreshTime] })

export { debugData }

export const isLoading = computed(() => debugStatus.value === 'pending')
export const moduleVersion = computed(() => debugData.value?.version || 'unknown')
export const siteUrl = computed(() => debugData.value?.siteUrl || '')
export const isConnected = computed(() => debugData.value?.connected || false)
export const proKeyConfigured = computed(() => debugData.value?.proKeyConfigured || false)

// Sync production URL from site config
watch(debugData, (data) => {
  if (data?.siteUrl) {
    productionUrl.value = data.siteUrl
  }
})

// Current page URL (siteUrl + current route path)
export const currentPageUrl = computed(() => {
  if (!siteUrl.value || !path.value)
    return ''
  const base = siteUrl.value.replace(/\/+$/, '')
  return `${base}${path.value}`
})

// Date range helpers (28-day default)
function get28dRange() {
  const end = new Date()
  end.setDate(end.getDate() - 3) // stable data latency
  const start = new Date(end)
  start.setDate(start.getDate() - 27)
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  // Previous period
  const prevEnd = new Date(start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - 27)
  return {
    start: fmt(start),
    end: fmt(end),
    prevStart: fmt(prevStart),
    prevEnd: fmt(prevEnd),
  }
}

// Page data: keywords for the current page
export const { data: pageData, error: pageDataError, status: pageDataStatus } = useAsyncData<GscdumpDataResponse | null>(
  'page-data',
  () => {
    if (!appFetch.value || !isConnected.value || !currentPageUrl.value)
      return Promise.resolve(null)

    const range = get28dRange()
    const state = {
      dimensions: ['queryCanonical'],
      filter: {
        type: 'and',
        filters: [
          { type: 'between', column: 'date', from: range.start, to: range.end },
          { type: 'eq', column: 'page', value: currentPageUrl.value },
        ],
      },
      orderBy: { column: 'clicks', dir: 'desc' },
      rowLimit: 50,
      startRow: 0,
    }
    const comparison = {
      dimensions: ['queryCanonical'],
      filter: {
        type: 'and',
        filters: [
          { type: 'between', column: 'date', from: range.prevStart, to: range.prevEnd },
          { type: 'eq', column: 'page', value: currentPageUrl.value },
        ],
      },
    }

    return appFetch.value<GscdumpDataResponse>('/__seo-pro-devtools/data', {
      query: { q: JSON.stringify(state), qc: JSON.stringify(comparison) },
    }).catch(() => null)
  },
  { watch: [refreshTime, path, () => isConnected.value], server: false },
)

export const pageKeywords = computed(() => pageData.value?.rows || [])
export const pageTotals = computed(() => pageData.value?.totals || null)
export const isPageDataLoading = computed(() => pageDataStatus.value === 'pending')

// Page detail: daily breakdown for sparkline
export const { data: pageDetail, status: pageDetailStatus } = useAsyncData<GscdumpDataDetailResponse | null>(
  'page-detail',
  () => {
    if (!appFetch.value || !isConnected.value || !currentPageUrl.value)
      return Promise.resolve(null)

    const range = get28dRange()
    const state = {
      dimensions: ['date'],
      filter: {
        type: 'and',
        filters: [
          { type: 'between', column: 'date', from: range.start, to: range.end },
          { type: 'eq', column: 'page', value: currentPageUrl.value },
        ],
      },
      orderBy: { column: 'date', dir: 'asc' },
    }

    return appFetch.value<GscdumpDataDetailResponse>('/__seo-pro-devtools/data-detail', {
      query: { q: JSON.stringify(state) },
    }).catch(() => null)
  },
  { watch: [refreshTime, path, () => isConnected.value], server: false },
)

export const dailyData = computed(() => pageDetail.value?.daily || [])
export const isPageDetailLoading = computed(() => pageDetailStatus.value === 'pending')

// Site-wide top pages
export const { data: sitePages, error: sitePagesError, status: sitePagesStatus } = useAsyncData<GscdumpDataResponse | null>(
  'site-pages',
  () => {
    if (!appFetch.value || !isConnected.value)
      return Promise.resolve(null)

    const range = get28dRange()
    const state = {
      dimensions: ['page'],
      filter: { type: 'between', column: 'date', from: range.start, to: range.end },
      orderBy: { column: 'clicks', dir: 'desc' },
      rowLimit: 50,
      startRow: 0,
    }
    const comparison = {
      dimensions: ['page'],
      filter: { type: 'between', column: 'date', from: range.prevStart, to: range.prevEnd },
    }

    return appFetch.value<GscdumpDataResponse>('/__seo-pro-devtools/data', {
      query: { q: JSON.stringify(state), qc: JSON.stringify(comparison) },
    }).catch(() => null)
  },
  { watch: [refreshTime, () => isConnected.value], server: false },
)

export const topPages = computed(() => sitePages.value?.rows || [])
export const siteTotals = computed(() => sitePages.value?.totals || null)
export const isSitePagesLoading = computed(() => sitePagesStatus.value === 'pending')

// Sync status
export const { data: syncStatus } = useAsyncData<SyncStatusResponse | null>(
  'sync-status',
  () => {
    if (!appFetch.value || !isConnected.value)
      return Promise.resolve(null)
    return appFetch.value<SyncStatusResponse>('/__seo-pro-devtools/sync-status').catch(() => null)
  },
  { watch: [refreshTime, () => isConnected.value], server: false },
)

export async function refreshAll() {
  await refreshNuxtData()
}

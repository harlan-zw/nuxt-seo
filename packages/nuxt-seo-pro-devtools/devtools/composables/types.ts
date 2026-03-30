export interface GscdumpDataRow {
  page?: string
  query?: string
  queryCanonical?: string
  country?: string
  device?: string
  date?: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  prevClicks?: number
  prevImpressions?: number
  prevCtr?: number
  prevPosition?: number
  topKeyword?: string
  topPage?: string
  variantCount?: number
}

export interface GscdumpMeta {
  siteUrl: string
  syncStatus: string
  newestDateSynced: string | null
  oldestDateSynced: string | null
  dataDelay: string
}

export interface GscdumpDataResponse {
  rows: GscdumpDataRow[]
  totalCount: number
  totals: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
  meta: GscdumpMeta
}

export interface GscdumpDataDetailResponse {
  daily: Array<{
    date: string
    clicks: number
    impressions: number
    ctr: number
    position: number
  }>
  totals: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
  previousTotals?: {
    clicks: number
    impressions: number
    ctr: number
    position: number
  }
  meta: GscdumpMeta
}

export interface DebugResponse {
  version: string
  siteUrl: string
  proKeyConfigured: boolean
  connected: boolean
  gscdumpSiteId: string | null
}

export interface SyncStatusResponse {
  sites: Array<{
    siteId: string
    siteUrl: string
    syncStatus: 'pending' | 'syncing' | 'synced'
    syncProgress?: { completed: number, total: number, percent: number }
    lastSyncAt: number | null
    newestDateSynced: string | null
    oldestDateSynced: string | null
  }>
}

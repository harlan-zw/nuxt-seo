import { defineEventHandler } from 'h3'
import { fetchGscdump } from '../../utils/gscdump'

export default defineEventHandler(async (event) => {
  return fetchGscdump(event, '/sites/:siteId/sync-status')
})

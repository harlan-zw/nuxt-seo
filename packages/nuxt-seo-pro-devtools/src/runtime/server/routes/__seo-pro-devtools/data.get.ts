import { defineEventHandler, getQuery } from 'h3'
import { fetchGscdump } from '../../utils/gscdump'

export default defineEventHandler(async (event) => {
  const { q, qc, filter } = getQuery(event) as Record<string, string>
  if (!q)
    throw createError({ statusCode: 400, message: 'Missing q query parameter' })

  const query: Record<string, string> = { q }
  if (qc)
    query.qc = qc
  if (filter)
    query.filter = filter

  return fetchGscdump(event, '/sites/:siteId/data', query)
})

import { defineEventHandler, getRouteRules } from 'nuxt/server'
export default defineEventHandler((event) => {
  const headers = getRouteRules(event).headers
  return {
    authorization: event.req.headers.get('authorization'),
    cookie: event.req.headers.get('cookie'),
    routeHeader: headers && typeof headers === 'object' && 'x-fixture-rule' in headers ? headers['x-fixture-rule'] : undefined,
  }
})

import { fetchWithEvent, useEvent, useRuntimeConfig } from '#nuxtseo/nitro'
import { defineEventHandler } from '#nuxtseo/h3'

function readRequestContextMarker() {
  return (useEvent().context as Record<string, unknown>).nitroCompatibilityMarker
}

export default defineEventHandler(async (event) => {
  ;(event.context as Record<string, unknown>).nitroCompatibilityMarker = 'nuxt-5-context'
  const forwarded = await fetchWithEvent<{ requestHeader: string }>(event, '/api/forwarded')
  return {
    forwardedRequestHeader: forwarded.requestHeader,
    marker: useRuntimeConfig().nitroCompatibilityMarker,
    requestContextMarker: readRequestContextMarker(),
  }
})

import { useEvent, useRuntimeConfig } from '#nuxtseo/nitro'
import { defineEventHandler } from '#nuxtseo/h3'

function readRequestContextMarker() {
  return (useEvent().context as Record<string, unknown>).nitroCompatibilityMarker
}

export default defineEventHandler((event) => {
  ;(event.context as Record<string, unknown>).nitroCompatibilityMarker = 'nuxt-4-context'
  return {
    marker: useRuntimeConfig().nitroCompatibilityMarker,
    requestContextMarker: readRequestContextMarker(),
  }
})

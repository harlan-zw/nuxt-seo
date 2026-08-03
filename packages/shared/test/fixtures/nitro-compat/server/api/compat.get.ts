import { useRuntimeConfig } from '#nuxtseo/nitro'
import { defineEventHandler } from '#nuxtseo/h3'

export default defineEventHandler(() => ({
  marker: useRuntimeConfig().nitroCompatibilityMarker,
}))

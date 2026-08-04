import { eventHandler } from '#nuxtseo/h3'
import { useRuntimeConfig } from '#nuxtseo/nitro'

export default eventHandler(event => ({
  marker: useRuntimeConfig(event).fixtureMarker,
}))

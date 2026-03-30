import { useDevtoolsConnection } from 'nuxtseo-layer-devtools/composables/rpc'
import { refreshSources } from 'nuxtseo-layer-devtools/composables/state'

useDevtoolsConnection({
  onConnected() { refreshSources() },
  onRouteChange() { refreshSources() },
})

import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { $Fetch } from 'nitropack/types'
import type { Ref } from 'vue'
import type { DevtoolsHost } from './host'
import { onDevtoolsClientConnected, useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { ofetch } from 'ofetch'
import { ref, watch, watchEffect } from 'vue'
import { createDevtoolsHost } from './host'
import { base, isConnected, path, query, refreshSources, standaloneUrl } from './state'

export const appFetch: Ref<$Fetch | undefined> = ref()
export const devtools: Ref<NuxtDevtoolsClient | undefined> = ref()
export const colorMode: Ref<'dark' | 'light'> = ref('dark')

export interface DevtoolsConnectionOptions {
  /**
   * Called once the embedded host is connected, with a guarded {@link DevtoolsHost}.
   * Only needed by modules that read host provides or open an RPC channel — route,
   * fetch, colorMode and base are already wired into layer state by the time this fires.
   */
  onConnected?: (host: DevtoolsHost) => void
  /** Called on every host route change (the layer already refreshes data itself). */
  onRouteChange?: (route: any) => void
}

/**
 * Initialize the base devtools connection.
 * Call this in your module's devtools client setup.
 *
 * Supports two modes:
 * - **Embedded**: running inside Nuxt DevTools iframe (automatic)
 * - **Standalone**: running directly in a browser tab with a manual dev server URL
 */
export function useDevtoolsConnection(options: DevtoolsConnectionOptions = {}): void {
  // Workaround: devtools-kit@4.0.0-alpha.3 bug where onDevtoolsClientConnected
  // defines a window.__NUXT_DEVTOOLS__ getter that reads clientRef.value, but
  // clientRef is only initialized by useDevtoolsClient(). Call it first to avoid
  // "Cannot read properties of undefined (reading 'value')" on the getter.
  useDevtoolsClient()

  // Embedded mode: connect via devtools-kit iframe client
  onDevtoolsClientConnected(async (client) => {
    isConnected.value = true
    const host = createDevtoolsHost(client)
    appFetch.value = host.fetch
    devtools.value = client.devtools
    // Kick an initial data load on connect regardless of route availability, so
    // modules that only needed "refresh once connected" require no onConnected.
    refreshSources()

    watchEffect(() => {
      colorMode.value = client.host?.app?.colorMode?.value ?? (
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      )
    })

    // The layer owns host route tracking so individual modules never have to
    // reach into the host Vue app. path/query/base feed every module's
    // useAsyncData(watch: [refreshTime]); refreshSources() bumps that clock.
    base.value = host.baseURL
    const applyRoute = (route: any): void => {
      if (!route)
        return
      path.value = route.path || '/'
      query.value = route.query
      refreshSources()
      options.onRouteChange?.(route)
    }
    applyRoute(host.route?.value)
    const $router = client.host?.nuxt?.$router
    if ($router) {
      const removeAfterEach = $router.afterEach((route: any) => applyRoute(route))
      // Clean up when devtools client disconnects
      // @ts-expect-error app:unmount exists at runtime but is not in RuntimeNuxtHooks
      client.host?.nuxt?.hook('app:unmount', removeAfterEach)
    }

    // Module-specific wiring (host provides / RPC channels) with the guarded host.
    // A throw here must not wedge the panel on "Connecting…": data loading only
    // needs appFetch (set above) plus a refreshTime bump, so recover with a refresh.
    try {
      options.onConnected?.(host)
    }
    catch (err) {
      console.error('[nuxt-seo] devtools onConnected handler failed, recovering with data refresh:', err)
      refreshSources()
    }
  })

  // Standalone mode: create appFetch from manually entered URL
  watch(() => standaloneUrl.value, (url) => {
    if (url && !isConnected.value) {
      appFetch.value = ofetch.create({ baseURL: url }) as unknown as $Fetch
      // Use system color scheme preference
      colorMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      refreshSources()
    }
  }, { immediate: true })
}

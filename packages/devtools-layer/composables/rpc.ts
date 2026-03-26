import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { $Fetch } from 'nitropack/types'
import type { Ref } from 'vue'
import { onDevtoolsClientConnected, useDevtoolsClient } from '@nuxt/devtools-kit/iframe-client'
import { ofetch } from 'ofetch'
import { ref, watch, watchEffect } from 'vue'
import { isConnected, refreshSources, standaloneUrl } from './state'

export const appFetch: Ref<$Fetch | undefined> = ref()
export const devtools: Ref<NuxtDevtoolsClient | undefined> = ref()
export const colorMode: Ref<'dark' | 'light'> = ref('dark')

export interface DevtoolsConnectionOptions {
  onConnected?: (client: any) => void
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
    // @ts-expect-error untyped
    appFetch.value = client.host?.app?.$fetch
    watchEffect(() => {
      colorMode.value = client.host?.app?.colorMode?.value ?? (
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      )
    })
    devtools.value = client.devtools
    options.onConnected?.(client)

    if (options.onRouteChange) {
      const $route = client.host?.nuxt?.vueApp?.config?.globalProperties?.$route
      if ($route)
        options.onRouteChange($route)
      const $router = client.host?.nuxt?.$router
      if ($router) {
        const removeAfterEach = $router.afterEach((route: any) => {
          options.onRouteChange!(route)
        })
        // Clean up when devtools client disconnects
        // @ts-expect-error app:unmount exists at runtime but is not in RuntimeNuxtHooks
        client.host.nuxt.hook('app:unmount', removeAfterEach)
      }
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

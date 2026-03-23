import type { NuxtDevtoolsClient } from '@nuxt/devtools-kit/types'
import type { $Fetch } from 'nitropack/types'
import type { Ref } from 'vue'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { ref, watchEffect } from 'vue'

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
 */
export function useDevtoolsConnection(options: DevtoolsConnectionOptions = {}): void {
  onDevtoolsClientConnected(async (client) => {
    // @ts-expect-error untyped
    appFetch.value = client.host.app.$fetch
    watchEffect(() => {
      colorMode.value = client.host.app.colorMode.value
    })
    devtools.value = client.devtools
    options.onConnected?.(client)

    if (options.onRouteChange) {
      const $route = client.host.nuxt.vueApp.config.globalProperties?.$route
      options.onRouteChange($route)
      const removeAfterEach = client.host.nuxt.$router.afterEach((route: any) => {
        options.onRouteChange!(route)
      })
      // Clean up when devtools client disconnects
      client.host.nuxt.hook('app:unmount', removeAfterEach)
    }
  })
}

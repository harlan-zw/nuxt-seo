import type { NuxtDevtoolsIframeClient } from '@nuxt/devtools-kit/types'
import type { BirpcReturn } from 'birpc'
import type { $Fetch } from 'nitropack/types'
import type { Ref } from 'vue'

/**
 * A narrow, version-resilient view over the Nuxt DevTools host.
 *
 * The devtools-kit iframe client (`NuxtDevtoolsIframeClient`) only types a small
 * stable surface (`host.app.$fetch`, `host.nuxt.$router`, `host.app.colorMode`,
 * `devtools.extendClientRpc`). Module clients historically reached *past* it into
 * Vue runtime internals (`vueApp._context.provides`, `vueApp._instance.appContext`,
 * `globalProperties.$route`), which differ across @nuxt/devtools versions and
 * threw, wedging the panel. This adapter is the single guarded place that touches
 * those internals; every module reads from it instead.
 */
export interface DevtoolsHost {
  /** `host.app.$fetch`, or undefined when the embedded host hasn't exposed it. */
  fetch: $Fetch | undefined
  /** Current host route, derived from the typed `$router`, never `globalProperties.$route`. */
  route: Ref<any> | undefined
  /** Host app base URL, resolved from runtime config then router history, falling back to '/'. */
  baseURL: string
  /** Resolve an app-level provide (e.g. `'usehead'`) regardless of which Vue internal exposes it. */
  inject: <T>(key: string | symbol) => T | undefined
  /** Open a birpc channel to the host, or undefined when the devtools bridge is unavailable. */
  rpc: <ServerFunctions = Record<string, never>, ClientFunctions = Record<string, never>>(
    namespace: string,
    handlers: ClientFunctions,
  ) => BirpcReturn<ServerFunctions, ClientFunctions> | undefined
  /** Open a file in the user's editor via the built-in devtools RPC (no-op if unavailable). */
  openInEditor: (path: string) => void
}

/**
 * Build a {@link DevtoolsHost} from a raw devtools-kit client.
 *
 * Pure: no import-time side effects, no connection logic. Takes the client as an
 * argument so it can be unit-tested against a malformed host without booting devtools.
 */
export function createDevtoolsHost(client: NuxtDevtoolsIframeClient | undefined): DevtoolsHost {
  const nuxt: any = client?.host?.nuxt
  const $router: any = nuxt?.$router
  const baseURL: string = nuxt?.$config?.app?.baseURL
    || $router?.options?.history?.base
    // @ts-expect-error host.app.baseURL is not in the typed surface; kept only as a last resort
    || client?.host?.app?.baseURL
    || '/'

  return {
    // @ts-expect-error host.app.$fetch is untyped on some versions
    fetch: client?.host?.app?.$fetch,
    route: $router?.currentRoute,
    baseURL,
    inject<T>(key: string | symbol): T | undefined {
      const app: any = nuxt?.vueApp
      const provides = app?._context?.provides ?? app?._instance?.appContext?.provides
      return provides?.[key]
    },
    rpc(namespace, handlers) {
      const extend = client?.devtools?.extendClientRpc
      if (typeof extend !== 'function')
        return undefined
      return extend(namespace, handlers) as any
    },
    openInEditor(path) {
      client?.devtools?.rpc?.openInEditor?.(path)
    },
  }
}

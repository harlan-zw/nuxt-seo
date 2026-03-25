import type { Resolver } from '@nuxt/kit'
import type { BirpcGroup } from 'birpc'
import type { Nuxt } from 'nuxt/schema'
import { existsSync, readdirSync } from 'node:fs'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
import sirv from 'sirv'

export type { BirpcGroup } from 'birpc'

export interface DevToolsUIConfig {
  route: string
  name: string
  title: string
  icon: string
  devPort?: number
}

export interface SeoModuleInfo {
  name: string
  title: string
  icon: string
  route: string
}

export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  const { route, name, title, icon, devPort = 3030 } = config
  const clientPath = resolve('./devtools')

  // Register this module in the shared SEO modules registry
  const modules: SeoModuleInfo[] = (nuxt as any)._seoDevtoolsModules ??= []
  modules.push({ name, title, icon, route })

  // Register shared RPC endpoint once (first module to call wins)
  if (!(nuxt as any)._seoDevtoolsRpcRegistered) {
    (nuxt as any)._seoDevtoolsRpcRegistered = true
    onDevToolsInitialized(() => {
      extendServerRpc('nuxt-seo-modules', {
        getInstalledSeoModules(): SeoModuleInfo[] {
          return (nuxt as any)._seoDevtoolsModules || []
        },
      }, nuxt)
    }, nuxt)
  }
  const isProductionBuild = existsSync(clientPath) && readdirSync(clientPath).length > 0

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', (server) => {
      server.middlewares.use(
        route,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      Object.assign(config, {
        server: {
          ...config.server,
          proxy: {
            ...config.server?.proxy,
            [route]: {
              target: `http://localhost:${devPort}${route}`,
              changeOrigin: true,
              followRedirects: true,
              ws: true,
              rewrite: (p: string) => p.replace(route, ''),
              configure: (proxy: any) => {
                proxy.on('error', (err: Error, _req: any, res: any) => {
                  if (res.headersSent)
                    return
                  res.writeHead(502, { 'Content-Type': 'text/plain' })
                  res.end(`Devtools client not ready: ${err.message}`)
                })
              },
            },
          },
        },
      })
    })
  }

  addCustomTab({
    name,
    title,
    icon,
    view: {
      type: 'iframe',
      src: route,
    },
  })
}

export function setupDevToolsRpc<
  ServerFunctions extends object,
  ClientFunctions extends object,
>(
  namespace: string,
  serverFunctions: ServerFunctions,
  nuxt: Nuxt = useNuxt(),
): Promise<BirpcGroup<ClientFunctions, ServerFunctions>> {
  return new Promise((resolve) => {
    onDevToolsInitialized(() => {
      resolve(extendServerRpc<ClientFunctions, ServerFunctions>(namespace, serverFunctions, nuxt))
    }, nuxt)
  })
}

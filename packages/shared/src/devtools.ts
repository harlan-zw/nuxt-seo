import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync } from 'node:fs'
import { addCustomTab } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'

export interface DevToolsUIConfig {
  route: string
  name: string
  title: string
  icon: string
  devPort?: number
}

export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  const { route, name, title, icon, devPort = 3030 } = config
  const clientPath = resolve('./client')
  const isProductionBuild = existsSync(clientPath)

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(
        route,
        sirv(clientPath, { dev: true, single: true }),
      )
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server ??= {}
      config.server.proxy ??= {}
      config.server.proxy[route] = {
        target: `http://localhost:${devPort}${route}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(route, ''),
      }
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

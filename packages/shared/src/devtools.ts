import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { existsSync } from 'node:fs'
import { addCustomTab } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
import sirv from 'sirv'

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
              rewrite: (p: string) => p.replace(route, ''),
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

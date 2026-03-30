import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from 'nuxt/schema'
import { addServerHandler, useNuxt } from '@nuxt/kit'
import { setupDevToolsUI as _setupDevToolsUI } from 'nuxtseo-shared/devtools'

export function setupDevToolsUI(resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()) {
  _setupDevToolsUI({
    route: '/__nuxt-seo-pro',
    name: 'nuxt-seo-pro-devtools',
    title: 'SEO Pro',
    icon: 'carbon:analytics',
    devPort: 3031,
  }, resolve, nuxt)

  addServerHandler({
    route: '/__seo-pro-devtools/debug',
    method: 'get',
    handler: resolve('./runtime/server/routes/__seo-pro-devtools/debug.get'),
  })

  addServerHandler({
    route: '/__seo-pro-devtools/data',
    method: 'get',
    handler: resolve('./runtime/server/routes/__seo-pro-devtools/data.get'),
  })

  addServerHandler({
    route: '/__seo-pro-devtools/data-detail',
    method: 'get',
    handler: resolve('./runtime/server/routes/__seo-pro-devtools/data-detail.get'),
  })

  addServerHandler({
    route: '/__seo-pro-devtools/sync-status',
    method: 'get',
    handler: resolve('./runtime/server/routes/__seo-pro-devtools/sync-status.get'),
  })
}

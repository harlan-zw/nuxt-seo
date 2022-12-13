import type { NitroAppPlugin, PrerenderGenerateRoute } from 'nitropack'

export const Sitemap: NitroAppPlugin = (nitroApp) => {
  console.log('sitemap plugin')
  const routes = []
  nitroApp.hooks.hook('prerender:route', async (route: PrerenderGenerateRoute) => {
    routes.push(route.route)
    console.log(route.route)
  })

  nitroApp.hooks.hook('rollup:before', async (nitro) => {
    console.log(nitro)
  })
}

export default Sitemap

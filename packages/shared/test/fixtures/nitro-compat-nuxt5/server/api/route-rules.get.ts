import { getRouteRules } from 'nitro/app'
import { defineEventHandler } from 'nuxt/server'

export default defineEventHandler((event) => {
  const { routeRules: rules } = getRouteRules(event.req.method, event.url.pathname)
  const robots: boolean | undefined = rules.robots
  const sitemap: boolean | undefined = rules.sitemap
  const ogImage: boolean | undefined = rules.ogImage
  const name: string | undefined = rules.site?.name
  return { robots, sitemap, ogImage, site: { name } }
})

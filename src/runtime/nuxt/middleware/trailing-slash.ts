import { withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { defineNuxtRouteMiddleware, navigateTo, useSiteConfig } from '#imports'

export default defineNuxtRouteMiddleware((route) => {
  if (import.meta.prerender)
    return

  const { trailingSlash } = useSiteConfig()

  let path = route.path

  if (trailingSlash !== undefined)
    path = trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)

  if (path !== route.path)
    return navigateTo({ path, query: route.query }, { redirectCode: 301 })
})

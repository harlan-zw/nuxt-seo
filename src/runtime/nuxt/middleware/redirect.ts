import { resolveURL, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { defineNuxtRouteMiddleware, navigateTo, useError, useRequestURL, useSiteConfig } from '#imports'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.prerender)
    return

  const siteConfig = useSiteConfig()
  const error = useError()
  const url = useRequestURL()

  const originalUrl = url.href

  let canonicalUrl
    = siteConfig.url && !import.meta.dev
      ? resolveURL(siteConfig.url, url.pathname, url.search, url.hash)
      : originalUrl

  if (siteConfig.trailingSlash !== undefined) {
    canonicalUrl = siteConfig.trailingSlash
      ? withTrailingSlash(canonicalUrl, true)
      : withoutTrailingSlash(canonicalUrl, true)
  }

  if (canonicalUrl !== originalUrl && !error.value)
    return navigateTo(canonicalUrl, { redirectCode: 301, external: true })
})

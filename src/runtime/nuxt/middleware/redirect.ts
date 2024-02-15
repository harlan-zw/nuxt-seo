import { resolveURL, withTrailingSlash } from 'ufo'
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useError,
  useRequestURL,
  useSiteConfig,
} from '#imports'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.prerender)
    return

  const { url: siteUrl } = useSiteConfig()
  const error = useError()
  const url = useRequestURL()

  const originalUrl = url.href

  const canonicalUrl
    = siteUrl && !import.meta.dev
      ? resolveURL(
        // Trailing slash for router hash mode
        withTrailingSlash(siteUrl),
        url.pathname,
        url.search,
        url.hash,
      )
      : originalUrl

  if (canonicalUrl !== originalUrl && !error.value)
    return navigateTo(canonicalUrl, { redirectCode: 301, external: true })
})

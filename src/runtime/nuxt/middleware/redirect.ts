import { resolveURL, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useError,
  useRequestURL,
  useRouter,
  useSiteConfig,
} from '#imports'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.prerender)
    return

  const siteConfig = useSiteConfig()
  const router = useRouter()
  const error = useError()
  const url = useRequestURL()

  const originalUrl = url.href

  let canonicalUrl
    = siteConfig.url && !import.meta.dev
      ? resolveURL(
        withTrailingSlash(siteConfig.url),
        url.pathname,
        url.search,
        url.hash,
      )
      : originalUrl

  // @ts-expect-error: router.options.hashMode
  if (siteConfig.trailingSlash !== undefined && !router.options.hashMode) {
    canonicalUrl = siteConfig.trailingSlash
      ? withTrailingSlash(canonicalUrl, true)
      : withoutTrailingSlash(canonicalUrl, true)
  }

  if (canonicalUrl !== originalUrl && !error.value)
    return navigateTo(canonicalUrl, { redirectCode: 301, external: true })
})

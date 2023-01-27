import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { siteUrl, trailingSlash } from '#nuxt-seo-kit/config'

export function resolveTrailingSlash(path: string) {
  return trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
export function resolveAbsoluteInternalLink(path: string) {
  return withBase(resolveTrailingSlash(path), siteUrl)
}

export function createInternalLinkResolver() {
  return (path: string) => {
    return withBase(trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path), siteUrl)
  }
}

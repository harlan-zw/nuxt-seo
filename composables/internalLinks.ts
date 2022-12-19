import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import config from '#nuxt-seo-kit/config'

export function resolveTrailingSlash(path: string) {
  return config.trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
export function resolveAbsoluteInternalLink(path: string) {
  return withBase(resolveTrailingSlash(path), config.siteUrl)
}

export function createInternalLinkResolver() {
  const { siteUrl, trailingSlash } = config
  return (path: string) => {
    return withBase(trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path), siteUrl)
  }
}

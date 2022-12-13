import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'

export function resolveTrailingSlash(path: string) {
  const { trailingSlash } = useRuntimeConfig().public
  return trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
export function resolveAbsoluteInternalLink(path: string) {
  const { siteUrl } = useRuntimeConfig().public
  return withBase(resolveTrailingSlash(path), siteUrl)
}

export function createInternalLinkResolver() {
  const { siteUrl, trailingSlash } = useRuntimeConfig().public
  return (path: string) => {
    return withBase(trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path), siteUrl)
  }
}

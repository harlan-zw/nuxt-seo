import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { useRuntimeConfig } from '#imports'

export function resolveTrailingSlash(path: string) {
  const config = useRuntimeConfig().public['nuxt-seo-kit']
  return config.trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
export function resolveAbsoluteInternalLink(path: string) {
  const config = useRuntimeConfig().public['nuxt-seo-kit']
  return withBase(resolveTrailingSlash(path), config.siteUrl)
}

export function createInternalLinkResolver() {
  const config = useRuntimeConfig().public['nuxt-seo-kit']
  return (path: string) => {
    return withBase(config.trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path), config.siteUrl)
  }
}

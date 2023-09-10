import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { useRuntimeConfig } from '#imports'

export function createInternalLinkResolver(absolute?: boolean) {
  const runtimeConfig = useRuntimeConfig().public['nuxt-seo-kit'] as unknown as { trailingSlash: boolean; siteUrl: string }
  return (path: string) => {
    const fixedSlash = runtimeConfig.trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
    if (absolute)
      return withBase(fixedSlash, runtimeConfig.siteUrl)

    return fixedSlash
  }
}

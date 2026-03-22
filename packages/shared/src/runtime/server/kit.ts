import type { H3Event } from 'h3'
import type { NitroRouteConfig } from 'nitropack'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { parseURL, withoutBase, withoutTrailingSlash } from 'ufo'

export function withoutQuery(path: string): string {
  return path.split('?')[0]!
}

export function createNitroRouteRuleMatcher(e?: H3Event): (path: string) => NitroRouteConfig {
  const { nitro, app } = useRuntimeConfig(e)
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {})
          .map(([path, rules]) => [path === '/' ? path : withoutTrailingSlash(path), rules]),
      ),
    }),
  )
  return (pathOrUrl: string) => {
    const path = pathOrUrl[0] === '/' ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname
    const pathWithoutQuery = withoutQuery(path)
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(pathWithoutQuery === '/' ? pathWithoutQuery : withoutTrailingSlash(pathWithoutQuery), app.baseURL),
    ).reverse()) as NitroRouteConfig
  }
}

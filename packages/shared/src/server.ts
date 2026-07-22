import type { NitroRouteRules, NitroRuntimeConfig } from 'nitropack'
import { defu } from 'defu'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { parseURL, withoutBase, withoutTrailingSlash } from 'ufo'

export function withoutQuery(path: string): string {
  const queryIndex = path.indexOf('?')
  return queryIndex === -1 ? path : path.slice(0, queryIndex)
}

export function createNitroRouteRuleMatcher(runtimeConfig: NitroRuntimeConfig): (pathOrUrl: string) => NitroRouteRules {
  const { nitro, app } = runtimeConfig
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {})
          .map(([path, rules]) => [withoutTrailingSlash(path), rules]),
      ),
    }),
  )
  return (pathOrUrl: string): NitroRouteRules => {
    const path = pathOrUrl[0] === '/' ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(withoutTrailingSlash(withoutQuery(path)), app.baseURL),
    ).reverse()) as NitroRouteRules
  }
}

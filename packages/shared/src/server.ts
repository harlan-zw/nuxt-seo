import type { H3Event } from 'h3'
import type { NitroRouteRules } from 'nitropack'
import { defu } from 'defu'
import { useRuntimeConfig } from 'nitropack/runtime'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { parseURL, withoutBase, withoutTrailingSlash } from 'ufo'

export function withoutQuery(path: string): string {
  const queryIndex = path.indexOf('?')
  return queryIndex === -1 ? path : path.slice(0, queryIndex)
}

let cachedRouteRuleMatcher: ((pathOrUrl: string) => NitroRouteRules) | undefined

export function createNitroRouteRuleMatcher(e?: H3Event): (pathOrUrl: string) => NitroRouteRules {
  if (!import.meta.dev && !e && cachedRouteRuleMatcher)
    return cachedRouteRuleMatcher

  const { nitro, app } = useRuntimeConfig(e)
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {})
          .map(([path, rules]) => [withoutTrailingSlash(path), rules]),
      ),
    }),
  )
  const matcher = (pathOrUrl: string): NitroRouteRules => {
    const path = pathOrUrl[0] === '/' ? pathOrUrl : parseURL(pathOrUrl, app.baseURL).pathname
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(withoutTrailingSlash(withoutQuery(path)), app.baseURL),
    ).reverse()) as NitroRouteRules
  }
  if (!import.meta.dev && !e)
    cachedRouteRuleMatcher = matcher
  return matcher
}

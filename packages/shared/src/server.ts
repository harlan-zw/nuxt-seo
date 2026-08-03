import { defu } from 'defu'
import { createRouter as createRadixRouter, toRouteMatcher } from 'radix3'
import { parseURL, withoutBase, withoutTrailingSlash } from 'ufo'

export interface NitroRouteRulesRuntimeConfig<TRouteRules extends Record<string, unknown>> {
  app?: {
    baseURL?: string
  }
  nitro?: {
    routeRules?: Record<string, TRouteRules>
  }
}

export function withoutQuery(path: string): string {
  const queryIndex = path.indexOf('?')
  return queryIndex === -1 ? path : path.slice(0, queryIndex)
}

export function createNitroRouteRuleMatcher<TRouteRules extends Record<string, unknown> = Record<string, unknown>>(
  runtimeConfig: NitroRouteRulesRuntimeConfig<TRouteRules>,
): (pathOrUrl: string) => TRouteRules {
  const { nitro, app } = runtimeConfig
  const baseURL = app?.baseURL || '/'
  const _routeRulesMatcher = toRouteMatcher(
    createRadixRouter({
      routes: Object.fromEntries(
        Object.entries(nitro?.routeRules || {})
          .map(([path, rules]) => [withoutTrailingSlash(path), rules]),
      ),
    }),
  )
  return (pathOrUrl: string): TRouteRules => {
    const path = pathOrUrl[0] === '/' ? pathOrUrl : parseURL(pathOrUrl, baseURL).pathname
    return defu({}, ..._routeRulesMatcher.matchAll(
      withoutBase(withoutTrailingSlash(withoutQuery(path)), baseURL),
    ).reverse()) as TRouteRules
  }
}

export function normalizeNitroMatchedRouteRules<
  TMatchedRouteRules extends Record<string, { options: unknown }> = Record<string, { options: unknown }>,
>(matchedRouteRules?: TMatchedRouteRules): { [Key in keyof TMatchedRouteRules]: TMatchedRouteRules[Key]['options'] } {
  return Object.fromEntries(
    Object.entries(matchedRouteRules || {}).map(([key, rule]) => [key, rule.options]),
  ) as { [Key in keyof TMatchedRouteRules]: TMatchedRouteRules[Key]['options'] }
}

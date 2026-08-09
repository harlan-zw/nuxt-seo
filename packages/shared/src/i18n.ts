import type { LocaleObject, NuxtI18nOptions } from '@nuxtjs/i18n'
import type { RuntimeI18nConfig, UnlocalizedLocalePage } from './i18n-runtime'
import { getNuxtModuleVersion, hasNuxtModule, hasNuxtModuleCompatibility } from '@nuxt/kit'
import { withBase, withHttps } from 'ufo'
import { localePath, resolveLocaleAlternates, resolveLocaleFromRoute } from './i18n-runtime'
import { getNuxtModuleOptions } from './kit'

export type {
  LocaleAlternate,
  LocaleAlternateResolution,
  LocalePagePaths,
  LocalePages,
  RouteLocaleInfo,
  RuntimeI18nConfig,
  RuntimeLocale,
  RuntimeRouteContext,
  UnlocalizedLocalePage,
} from './i18n-runtime'

const I18N_MODULES = ['@nuxtjs/i18n', 'nuxt-i18n-micro'] as const
type I18nModuleName = typeof I18N_MODULES[number]

export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

export type NormalisedLocale = LocaleObject & { _sitemap: string, _hreflang: string }

export interface AutoI18nConfig {
  locales: NormalisedLocale[]
  defaultLocale: string
  strategy: Strategies
  differentDomains?: boolean
  multiDomainLocales?: boolean
  routesNameSeparator?: string
  defaultLocaleRouteNameSuffix?: string
  pages?: Record<string, Record<string, string | false> | UnlocalizedLocalePage | false>
}

type I18nPages = NonNullable<AutoI18nConfig['pages']>

function isUnlocalizedLocalePage(page: Exclude<I18nPages[string], false | undefined>): page is UnlocalizedLocalePage {
  return page._tag === 'unlocalized' && typeof page.path === 'string'
}

interface NuxtI18nMicroOptions extends NuxtI18nOptions {
  globalLocaleRoutes?: Record<string, I18nPages[string] | boolean>
}

export interface StrategyProps {
  localeCode: string
  pageLocales: string
  nuxtI18nConfig: NuxtI18nOptions
  forcedStrategy?: Strategies
  normalisedLocales: AutoI18nConfig['locales']
}

export function generatePathForI18nPages(ctx: StrategyProps): string {
  const { localeCode, pageLocales, nuxtI18nConfig, forcedStrategy, normalisedLocales } = ctx
  const locale = normalisedLocales.find(l => l.code === localeCode)
  const strategy = forcedStrategy ?? nuxtI18nConfig.strategy as Strategies
  const i18n = toRuntimeI18nConfig({
    defaultLocale: nuxtI18nConfig.defaultLocale!,
    locales: normalisedLocales,
    strategy: strategy === 'prefix_and_default' ? 'prefix_except_default' : strategy,
  })
  const generated = localePath(pageLocales, localeCode, i18n)
  const prefixed = generated === localePath(pageLocales, localeCode, { ...i18n, strategy: 'prefix' })
  const path = prefixed ? generated.slice(1) : pageLocales
  return locale?.domain ? withHttps(withBase(path, locale.domain)) : path
}

export function splitPathForI18nLocales(path: string, autoI18n: AutoI18nConfig): string | string[] {
  const selectedLocales = autoI18n.strategy === 'prefix_except_default'
    ? autoI18n.locales.filter(l => l.code !== autoI18n.defaultLocale)
    : autoI18n.locales
  if (!path || path.startsWith('/_'))
    return path

  const localeCodes = new Set<string>(selectedLocales.map(locale => locale.code))
  const runtimeI18n = toRuntimeI18nConfig(autoI18n)
  const i18n = {
    ...runtimeI18n,
    strategy: 'prefix' as const,
    locales: runtimeI18n.locales.filter(locale => localeCodes.has(locale.code)),
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const resolved = resolveLocaleFromRoute(normalizedPath, i18n)
  const hasLocalePrefix = i18n.locales.some(l =>
    l.code === resolved.locale && localePath(resolved.basePath, l.code, i18n) === normalizedPath,
  )
  if (hasLocalePrefix)
    return path
  return [
    path,
    ...i18n.locales.map(l => localePath(path, l.code, i18n)),
  ]
}

// Anchored to the start: the compacted segment is always a leading path prefix
// (`/:locale(en|fr)` + route path). Anchoring keeps matching linear and avoids the
// polynomial backtracking CodeQL flags on unanchored `[^)]+` searches.
const COMPACT_LOCALE_PATTERN = /^\/:locale\(([^)]+)\)/

export interface ExpandedLocaleRoute {
  locale: string
  path: string
}

/**
 * Detect a compacted i18n route such as `/:locale(en|fr)/about`.
 *
 * Both `nuxt-i18n-micro` and `@nuxtjs/i18n` (experimental `compactRoutes`) collapse
 * per-locale routes into a single regex route using this syntax, so route-table
 * consumers (sitemap, link-checker) see one `:locale(...)` route instead of one per
 * locale.
 */
export function isCompactLocaleRoute(path: string): boolean {
  return COMPACT_LOCALE_PATTERN.test(path)
}

/**
 * Expand a compacted i18n route into one entry per locale.
 *
 * `/:locale(en|fr)/about` -> `[{ locale: 'en', path: '/en/about' }, { locale: 'fr', path: '/fr/about' }]`
 *
 * Pass `knownLocales` to guard against a genuine `:locale` route param: when provided,
 * expansion only runs if at least one captured token is a real locale code. Returns
 * `null` when the path is not a compacted locale route.
 */
export function expandCompactLocaleRoute(path: string, knownLocales?: string[]): ExpandedLocaleRoute[] | null {
  const match = COMPACT_LOCALE_PATTERN.exec(path)
  if (!match?.[1])
    return null
  const locales = match[1].split('|')
  if (knownLocales?.length && !locales.some(l => knownLocales.includes(l)))
    return null
  return locales.map(locale => ({
    locale,
    path: path.replace(COMPACT_LOCALE_PATTERN, `/${locale}`),
  }))
}

export function normalizeLocales(nuxtI18nConfig: NuxtI18nOptions): AutoI18nConfig['locales'] {
  const rawLocales = nuxtI18nConfig.locales || []
  let onlyLocales = nuxtI18nConfig?.bundle?.onlyLocales || []
  onlyLocales = typeof onlyLocales === 'string' ? [onlyLocales] : onlyLocales
  let locales = mergeOnKey(rawLocales.map(locale => typeof locale === 'string' ? { code: locale } : locale), 'code') as LocaleObject[]
  if (onlyLocales.length) {
    locales = locales.filter(locale => onlyLocales.includes(locale.code))
  }
  return locales.map((locale) => {
    if (typeof locale.iso === 'string' && !locale.language) {
      locale.language = locale.iso
    }
    const _hreflang = locale.language || locale.code
    const _sitemap = locale.language || locale.code
    return { ...locale, _hreflang, _sitemap }
  })
}

export interface ResolvedI18nRoute {
  name?: string
  path: string
  children?: ResolvedI18nRoute[]
}

interface FlatResolvedI18nRoute {
  name?: string
  locale?: string
  path: string
  isDefaultTree: boolean
}

function joinRoutePath(parentPath: string, path: string): string {
  if (path.startsWith('/'))
    return path
  if (!path)
    return parentPath || '/'
  return `${parentPath === '/' ? '' : parentPath.replace(/\/$/, '')}/${path}`
}

function resolveLocalizedRouteName(
  name: string | undefined,
  autoI18n: AutoI18nConfig,
): Pick<FlatResolvedI18nRoute, 'name' | 'locale' | 'isDefaultTree'> {
  if (!name)
    return { name, isDefaultTree: false }

  const separator = autoI18n.routesNameSeparator || '___'
  const defaultSuffix = autoI18n.defaultLocaleRouteNameSuffix || 'default'
  const segments = name.split(separator)
  const isDefaultTree = segments.at(-1) === defaultSuffix
    && autoI18n.locales.some(locale => locale.code === segments.at(-2))
  if (isDefaultTree)
    segments.pop()
  const locale = autoI18n.locales.find(locale => locale.code === segments.at(-1))?.code
  if (locale)
    segments.pop()
  return {
    name: segments.join(separator),
    ...(locale ? { locale } : {}),
    isDefaultTree,
  }
}

function flattenResolvedI18nRoutes(
  routes: readonly ResolvedI18nRoute[],
  autoI18n: AutoI18nConfig,
  parentPath = '',
): FlatResolvedI18nRoute[] {
  return routes.flatMap((route) => {
    const path = joinRoutePath(parentPath, route.path)
    return [
      { ...resolveLocalizedRouteName(route.name, autoI18n), path },
      ...flattenResolvedI18nRoutes(route.children || [], autoI18n, path),
    ]
  })
}

/** Normalize an i18n `pages` key to the corresponding resolved Nuxt route name. Build-time only. */
export function normalizeI18nPageKey(key: string): string {
  return key
    .replace(/^\//, '')
    .replace(/\/index$/, '')
    .replace(/\[{1,2}(?:\.\.\.)?([^\]]+)\]{1,2}/g, '$1')
    .split('/')
    .filter(segment => !/^\([^)]+\)$/.test(segment))
    .join('-')
}

function routeBasePath(route: FlatResolvedI18nRoute, autoI18n: AutoI18nConfig): string {
  if (!route.locale || autoI18n.strategy === 'no_prefix')
    return route.path
  return resolveLocaleFromRoute(route.path, toRuntimeI18nConfig(autoI18n), { locale: route.locale }).basePath
}

/**
 * Complete partial i18n `pages` entries from Nuxt's resolved route table.
 *
 * Route names are identifiers, not URL paths. The resolved route path is the
 * only safe fallback for nested, dynamic, grouped, or custom Nuxt routes.
 * Whole-route `false` becomes a tagged entry carrying that resolved path.
 */
export function materializeI18nPages(
  autoI18n: AutoI18nConfig,
  routes: readonly ResolvedI18nRoute[],
): I18nPages | undefined {
  const pages = autoI18n.pages
  if (!pages)
    return undefined

  const resolvedRoutes = flattenResolvedI18nRoutes(routes, autoI18n)
  return Object.fromEntries(Object.entries(pages).map(([pageName, pageLocales]) => {
    const normalizedPageName = normalizeI18nPageKey(pageName)
    const namedRoutes = resolvedRoutes.filter(route => route.name === pageName || route.name === normalizedPageName)
    if (pageLocales === false) {
      const route = namedRoutes.find(route => route.locale === autoI18n.defaultLocale)
        || namedRoutes.find(route => !route.locale)
        || namedRoutes[0]
      return [pageName, route
        ? { _tag: 'unlocalized', path: routeBasePath(route, autoI18n) }
        : false]
    }
    if (isUnlocalizedLocalePage(pageLocales))
      return [pageName, pageLocales]
    const explicitlyMatchedRoute = resolvedRoutes.find(route => Object.values(pageLocales).some(configuredPath =>
      typeof configuredPath === 'string' && routeBasePath(route, autoI18n) === configuredPath,
    ))
    const routeGroup = namedRoutes.length
      ? namedRoutes
      : explicitlyMatchedRoute?.name
        ? resolvedRoutes.filter(route => route.name === explicitlyMatchedRoute.name)
        : []
    const defaultRoute = routeGroup.find(route => route.locale === autoI18n.defaultLocale && route.isDefaultTree)
      || routeGroup.find(route => route.locale === autoI18n.defaultLocale)
      || routeGroup.find(route => !route.locale)
      || routeGroup.find(route => route.locale && pageLocales[route.locale] === undefined)
    const originalPath = defaultRoute ? routeBasePath(defaultRoute, autoI18n) : undefined
    const defaultPath = pageLocales[autoI18n.defaultLocale]
    const fallbackPath = typeof defaultPath === 'string' ? defaultPath : originalPath

    return [pageName, Object.fromEntries(autoI18n.locales.flatMap((locale) => {
      const configuredPath = pageLocales[locale.code]
      if (configuredPath !== undefined)
        return [[locale.code, configuredPath]]
      return fallbackPath === undefined ? [] : [[locale.code, fallbackPath]]
    }))]
  }))
}

export function mapPathForI18nPages(
  path: string,
  autoI18n: AutoI18nConfig,
  routes: readonly ResolvedI18nRoute[] = [],
): string[] | false {
  const pages = autoI18n.pages
  if (!pages || !Object.keys(pages).length)
    return false

  const materializedPages = routes.length ? materializeI18nPages(autoI18n, routes) : pages
  const resolvedRoutes = flattenResolvedI18nRoutes(routes, autoI18n)
  const pagesForMapping = Object.fromEntries(Object.entries(materializedPages || {}).map(([pageName, pageLocales]) => {
    if (pageLocales !== false)
      return [pageName, pageLocales]
    const normalizedPageName = normalizeI18nPageKey(pageName)
    const route = resolvedRoutes.find(route => route.name === pageName || route.name === normalizedPageName)
    if (!route)
      return [pageName, false]
    const originalPath = routeBasePath(route, autoI18n)
    return [pageName, Object.fromEntries(autoI18n.locales.map(locale => [
      locale.code,
      locale.code === autoI18n.defaultLocale ? originalPath : false,
    ]))]
  }))
  const i18n = toRuntimeI18nConfig({
    ...autoI18n,
    strategy: autoI18n.strategy === 'prefix_and_default' ? 'prefix_except_default' : autoI18n.strategy,
    pages: pagesForMapping,
  })
  const resolved = resolveLocaleAlternates(path, i18n, autoI18n.strategy === 'no_prefix'
    ? { locale: autoI18n.defaultLocale }
    : {})
  if (resolved._tag === 'strategy')
    return false

  return resolved.alternates
    .map(alternate => alternate.domain
      ? withHttps(withBase(alternate.path, alternate.domain))
      : alternate.path)
}

export interface I18nModuleResolution {
  module: I18nModuleName
  isMicro: boolean
}

/**
 * Detect which i18n module is installed (@nuxtjs/i18n or nuxt-i18n-micro).
 *
 * Returns `false` when neither is installed.
 */
export function resolveI18nModule(): false | I18nModuleResolution {
  const found = I18N_MODULES.find(m => hasNuxtModule(m))
  if (!found)
    return false
  return {
    module: found,
    isMicro: found === 'nuxt-i18n-micro',
  }
}

function resolveI18nPages(config: NuxtI18nOptions, isMicro: boolean): I18nPages | undefined {
  const routes = isMicro
    ? (config as NuxtI18nMicroOptions).globalLocaleRoutes
    : config.pages
  if (!routes)
    return undefined

  return Object.fromEntries(
    Object.entries(routes).filter((entry): entry is [string, I18nPages[string]] =>
      entry[1] === false || (typeof entry[1] === 'object' && entry[1] !== null && !Array.isArray(entry[1]))),
  )
}

export async function resolveI18nConfig(logger?: { warn: (msg: string) => void }): Promise<false | AutoI18nConfig> {
  const i18n = resolveI18nModule()
  if (!i18n)
    return false

  if (!i18n.isMicro) {
    const i18nVersion = await getNuxtModuleVersion(i18n.module)
    if (!await hasNuxtModuleCompatibility(i18n.module, '>=8')) {
      logger?.warn(`You are using ${i18n.module} v${i18nVersion}. For the best compatibility, please upgrade to ${i18n.module} v8.0.0 or higher.`)
    }
  }

  const nuxtI18nConfig = (await getNuxtModuleOptions(i18n.module) || {}) as NuxtI18nOptions
  const normalisedLocales = normalizeLocales(nuxtI18nConfig)
  const pages = resolveI18nPages(nuxtI18nConfig, i18n.isMicro)
  const usingI18nPages = Object.keys(pages || {}).length
  const hasI18nConfigForAlternatives = nuxtI18nConfig.differentDomains
    || nuxtI18nConfig.multiDomainLocales
    || usingI18nPages
    || (nuxtI18nConfig.strategy !== 'no_prefix' && nuxtI18nConfig.locales)
  if (!hasI18nConfigForAlternatives)
    return false

  return {
    differentDomains: nuxtI18nConfig.differentDomains,
    multiDomainLocales: nuxtI18nConfig.multiDomainLocales,
    routesNameSeparator: nuxtI18nConfig.routesNameSeparator,
    defaultLocaleRouteNameSuffix: nuxtI18nConfig.defaultLocaleRouteNameSuffix,
    defaultLocale: nuxtI18nConfig.defaultLocale!,
    locales: normalisedLocales,
    strategy: nuxtI18nConfig.strategy as Strategies,
    pages,
  }
}

/**
 * Strip a build-time i18n config down to what `./i18n-runtime` needs, dropping
 * the non-serializable `LocaleObject` extras so it can be handed to the runtime
 * through `runtimeConfig`. Materialize partial and whole-route-false `pages`
 * entries before calling this function; unresolved whole-route false entries
 * are omitted instead of becoming fabricated runtime URLs.
 */
export function toRuntimeI18nConfig(auto: AutoI18nConfig): RuntimeI18nConfig {
  const pages = auto.pages && Object.fromEntries(
    Object.entries(auto.pages).filter((entry): entry is [string, Exclude<I18nPages[string], false | undefined>] => entry[1] !== false),
  )
  return {
    defaultLocale: auto.defaultLocale,
    strategy: auto.strategy,
    ...(auto.differentDomains ? { differentDomains: true } : {}),
    ...(auto.multiDomainLocales ? { multiDomainLocales: true } : {}),
    // Translated route paths. Without these the runtime can only guess
    // alternates by adding/removing a locale prefix, which is wrong for every
    // page whose slug differs per locale.
    ...(pages && Object.keys(pages).length ? { pages } : {}),
    locales: auto.locales.map((l) => {
      const raw = l as typeof l & {
        name?: string
        nativeName?: string
        language?: string
        domain?: string
        domains?: string[]
        defaultForDomains?: string[]
      }
      return {
        code: l.code,
        hreflang: l._hreflang || raw.language || l.code,
        name: raw.name,
        nativeName: raw.nativeName ?? raw.name,
        ...(raw.language ? { language: raw.language } : {}),
        ...(raw.domain ? { domain: raw.domain } : {}),
        ...(raw.domains?.length ? { domains: [...raw.domains] } : {}),
        ...(raw.defaultForDomains?.length ? { defaultForDomains: [...raw.defaultForDomains] } : {}),
      }
    }),
  }
}

export function mergeOnKey<T extends Record<string, any>>(arr: T[], key: keyof T): T[] {
  const map = new Map<string, T>()
  for (const item of arr) {
    const k = item[key]
    if (map.has(k)) {
      map.set(k, { ...map.get(k)!, ...item })
    }
    else {
      map.set(k, item)
    }
  }
  return [...map.values()]
}

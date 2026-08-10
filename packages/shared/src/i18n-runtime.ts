/**
 * Runtime-safe i18n route resolution.
 *
 * `./i18n` reaches for `@nuxt/kit` to read the installed module's options, so it
 * can only run at build time. This entry carries no build-time dependencies and
 * is importable from a module's runtime (nitro handlers, plugins, composables).
 * Feed it the config `toRuntimeI18nConfig()` produces.
 */

/**
 * Resolved route paths keyed by route name, then locale code. Per-locale
 * `false` disables that locale. A tagged unlocalized entry represents i18n's
 * whole-route `false` after build-time materialization.
 *
 * ```
 * { about: { en: '/about', fr: '/a-propos' }, admin: { _tag: 'unlocalized', path: '/admin' } }
 * ```
 */
export type LocalePagePaths = Record<string, string | false>

export interface UnlocalizedLocalePage {
  /** Route excluded from i18n localization by a whole-route `pages` false. */
  _tag: 'unlocalized'
  /** Original resolved Nuxt route pattern. */
  path: string
  /** The route has children, which i18n also leaves unlocalized. */
  subtree?: true
}

export type LocalePages = Record<string, LocalePagePaths | UnlocalizedLocalePage | undefined>

function isUnlocalizedLocalePage(page: LocalePagePaths | UnlocalizedLocalePage): page is UnlocalizedLocalePage {
  return page._tag === 'unlocalized' && typeof page.path === 'string'
}

function matchesUnlocalizedLocalePage(page: UnlocalizedLocalePage, path: string): boolean {
  if (matchPagePattern(page.path, path))
    return true
  if (!page.subtree)
    return false
  const subtreePattern = `${page.path === '/' ? '' : page.path.replace(/\/$/, '')}/[...__nuxtSeoSubtree]`
  return !!matchPagePattern(subtreePattern, path)
}

export interface RuntimeLocale {
  code: string
  hreflang: string
  name?: string
  nativeName?: string
  language?: string
  domain?: string
  domains?: string[]
  defaultForDomains?: string[]
}

/** Runtime-safe subset of `AutoI18nConfig` used for route locale resolution. */
export interface RuntimeI18nConfig {
  defaultLocale: string
  strategy: 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
  locales: RuntimeLocale[]
  differentDomains?: boolean
  multiDomainLocales?: boolean
  /** Translated route paths, when i18n is configured with custom routes. */
  pages?: LocalePages
}

export interface LocaleAlternate {
  code: string
  hreflang: string
  path: string
  domain?: string
}

export type LocaleAlternateResolution
  = | { _tag: 'pages', alternates: LocaleAlternate[] }
    | { _tag: 'strategy', alternates: LocaleAlternate[] }

export interface RouteLocaleInfo {
  /** Resolved locale code for this route */
  locale: string
  /** Route with locale prefix stripped (e.g. /fr/about → /about). For no_prefix this equals route. */
  basePath: string
}

export interface RuntimeRouteContext {
  /** Request host, used to resolve locales under domain-based strategies. */
  host?: string
  /** Known current locale, required to translate no_prefix routes without a locale domain. */
  locale?: string
}

function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/^[a-z][a-z\d+.-]*:\/\//, '').split('/')[0]!
}

function localeDomains(locale: RuntimeLocale): string[] {
  return locale.domains?.length ? locale.domains : locale.domain ? [locale.domain] : []
}

function resolveLocaleFromHost(host: string | undefined, i18n: RuntimeI18nConfig): RuntimeLocale | undefined {
  if (!host)
    return undefined
  const normalizedHost = normalizeHost(host)
  const domainDefault = i18n.locales.find(locale =>
    locale.defaultForDomains?.some(domain => normalizeHost(domain) === normalizedHost),
  )
  if (domainDefault)
    return domainDefault
  const matches = i18n.locales.filter(locale =>
    localeDomains(locale).some(domain => normalizeHost(domain) === normalizedHost),
  )
  return matches.length === 1 ? matches[0] : matches.find(locale => locale.code === i18n.defaultLocale)
}

function firstLocaleDomain(locale: RuntimeLocale | undefined): string | undefined {
  return locale?.defaultForDomains?.[0] || locale?.domain || locale?.domains?.[0]
}

/**
 * Resolve the canonical domain for a locale. Domainless locales are served on
 * every domain, so their stable canonical is the default locale's domain.
 */
export function resolveCanonicalLocaleDomain(
  locale: RuntimeLocale | undefined,
  defaultLocale?: RuntimeLocale,
): string | undefined {
  return firstLocaleDomain(locale) || firstLocaleDomain(defaultLocale)
}

function splitRouteSuffix(route: string): { pathname: string, suffix: string } {
  const suffixIndex = route.search(/[?#]/)
  const rawPathname = suffixIndex === -1 ? route : route.slice(0, suffixIndex)
  return {
    pathname: rawPathname ? (rawPathname.startsWith('/') ? rawPathname : `/${rawPathname}`) : '/',
    suffix: suffixIndex === -1 ? '' : route.slice(suffixIndex),
  }
}

/**
 * Resolve which locale a route belongs to and the locale-stripped base path.
 */
export function resolveLocaleFromRoute(route: string, i18n: RuntimeI18nConfig, context: RuntimeRouteContext = {}): RouteLocaleInfo {
  const { pathname, suffix } = splitRouteSuffix(route)
  if (i18n.strategy !== 'no_prefix') {
    const segments = pathname.split('/').filter(Boolean)
    const first = segments[0]
    const matched = first ? i18n.locales.find(l => l.code === first) : undefined

    if (matched) {
      const rest = segments.slice(1).join('/')
      const trailingSlash = rest && pathname.endsWith('/') ? '/' : ''
      return { locale: matched.code, basePath: `${rest ? `/${rest}${trailingSlash}` : '/'}${suffix}` }
    }
  }

  const contextLocale = context.locale
    ? i18n.locales.find(locale => locale.code === context.locale)
    : undefined
  const domainLocale = resolveLocaleFromHost(context.host, i18n)
  return { locale: contextLocale?.code || domainLocale?.code || i18n.defaultLocale, basePath: `${pathname}${suffix}` }
}

/**
 * Build the URL path for a base path under a given locale, honoring the i18n strategy.
 */
export function localePath(
  basePath: string,
  locale: string,
  i18n: RuntimeI18nConfig,
  context: RuntimeRouteContext = {},
): string {
  const { pathname, suffix } = splitRouteSuffix(basePath)
  if (i18n.strategy === 'no_prefix')
    return `${pathname}${suffix}`

  const isDefault = locale === i18n.defaultLocale
  const localeConfig = i18n.locales.find(item => item.code === locale)
  const normalizedHost = context.host ? normalizeHost(context.host) : undefined
  const matchesDomainDefault = !!normalizedHost
    && !!localeConfig?.defaultForDomains?.some(domain => normalizeHost(domain) === normalizedHost)
  const isDomainDefault = i18n.differentDomains
    || matchesDomainDefault
  if (i18n.strategy === 'prefix_except_default' && (isDefault || isDomainDefault))
    return `${pathname}${suffix}`
  if (i18n.strategy === 'prefix_and_default' && isDomainDefault)
    return `${pathname}${suffix}`

  // prefix, prefix_and_default, prefix_except_default (non-default)
  if (pathname === '/')
    return `/${locale}${suffix}`
  return `/${locale}${pathname}${suffix}`
}

function toSegments(path: string): string[] {
  return path.split('/').filter(Boolean)
}

interface PageParam {
  name: string
  catchAll: boolean
  optional: boolean
}

interface StaticPageToken {
  _tag: 'static'
  value: string
}

interface ParamPageToken {
  _tag: 'param'
  param: PageParam
}

type PageToken = StaticPageToken | ParamPageToken

// Nuxt bracket params plus the Vue Router forms i18n emits. Parsing tokens
// instead of whole segments also covers paths such as `/archive/[year]-[slug]`.
const PAGE_PARAM_PATTERN = /\[\[(\.\.\.)?([^[\]]+)\]\]|\[(\.\.\.)?([^[\]]+)\]|:(\w+)(?:\((\.\*)?\))?([?*+]?)/g

function parsePageSegment(segment: string): PageToken[] {
  const tokens: PageToken[] = []
  let offset = 0

  for (const match of segment.matchAll(PAGE_PARAM_PATTERN)) {
    const index = match.index
    if (index > offset)
      tokens.push({ _tag: 'static', value: segment.slice(offset, index) })

    if (match[2]) {
      tokens.push({ _tag: 'param', param: { name: match[2], catchAll: !!match[1], optional: true } })
    }
    else if (match[4]) {
      tokens.push({ _tag: 'param', param: { name: match[4], catchAll: !!match[3], optional: false } })
    }
    else {
      const modifier = match[7]
      const routePattern = match[6]
      tokens.push({
        _tag: 'param',
        param: {
          name: match[5]!,
          catchAll: !!routePattern?.includes('.*') || modifier === '*' || modifier === '+',
          optional: modifier === '?' || modifier === '*',
        },
      })
    }
    offset = index + match[0].length
  }

  if (offset < segment.length)
    tokens.push({ _tag: 'static', value: segment.slice(offset) })
  return tokens.length ? tokens : [{ _tag: 'static', value: segment }]
}

function wholeSegmentParam(tokens: PageToken[]): PageParam | null {
  return tokens.length === 1 && tokens[0]?._tag === 'param' ? tokens[0].param : null
}

/**
 * Specificity of each segment, most specific first: static beats a param, a
 * param beats a catch-all. Mirrors how the router itself ranks routes, so the
 * order entries happen to be declared in doesn't decide which page a path
 * belongs to.
 */
function segmentRanks(pattern: string): number[] {
  return toSegments(pattern).map((segment) => {
    const tokens = parsePageSegment(segment)
    const params = tokens.filter((token): token is ParamPageToken => token._tag === 'param')
    if (!params.length)
      return 6
    const hasStatic = tokens.some(token => token._tag === 'static')
    if (hasStatic)
      return params.some(token => token.param.optional) ? 3 : 4
    const param = params[0]!.param
    if (param.catchAll)
      return param.optional ? -1 : 0
    return param.optional ? 1 : 2
  })
}

/** Negative when `a` is more specific than `b`, for use as a sort comparator. */
function compareSpecificity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i++) {
    const diff = b[i]! - a[i]!
    if (diff !== 0)
      return diff
  }
  // When both patterns match, extra segments are optional. The exact, shorter
  // route wins over a sibling such as `/blog/[[slug]]`.
  return a.length - b.length
}

function matchSegmentTokens(tokens: PageToken[], path: string): Record<string, string> | null {
  const failedStates = new Set<number>()

  function visit(index: number, offset: number, params: Record<string, string>): Record<string, string> | null {
    const state = index * (path.length + 1) + offset
    if (failedStates.has(state))
      return null
    if (index === tokens.length) {
      if (offset === path.length)
        return params
      failedStates.add(state)
      return null
    }

    const token = tokens[index]!
    if (token._tag === 'static') {
      const matched = path.startsWith(token.value, offset)
        ? visit(index + 1, offset + token.value.length, params)
        : null
      if (!matched)
        failedStates.add(state)
      return matched
    }

    const minimumEnd = token.param.optional ? offset : offset + 1
    for (let end = minimumEnd; end <= path.length; end++) {
      const value = path.slice(offset, end)
      const nextParams = value ? { ...params, [token.param.name]: value } : params
      const matched = visit(index + 1, end, nextParams)
      if (matched)
        return matched
    }
    failedStates.add(state)
    return null
  }

  return visit(0, 0, {})
}

/**
 * Match a route pattern from the pages map against a concrete path, capturing
 * dynamic segments. Returns null when the path belongs to a different route.
 */
function matchPagePattern(pattern: string, path: string): Record<string, string> | null {
  const patternSegments = toSegments(pattern)
  const pathSegments = toSegments(path)
  const failedStates = new Set<number>()

  function visit(patternIndex: number, pathIndex: number, params: Record<string, string>): Record<string, string> | null {
    const state = patternIndex * (pathSegments.length + 1) + pathIndex
    if (failedStates.has(state))
      return null
    if (patternIndex === patternSegments.length) {
      if (pathIndex === pathSegments.length)
        return params
      failedStates.add(state)
      return null
    }

    const tokens = parsePageSegment(patternSegments[patternIndex]!)
    const param = wholeSegmentParam(tokens)
    if (param?.catchAll) {
      const minimumEnd = param.optional ? pathIndex : pathIndex + 1
      for (let end = pathSegments.length; end >= minimumEnd; end--) {
        const value = pathSegments.slice(pathIndex, end).join('/')
        const nextParams = value ? { ...params, [param.name]: value } : params
        const matched = visit(patternIndex + 1, end, nextParams)
        if (matched)
          return matched
      }
      failedStates.add(state)
      return null
    }

    const segment = pathSegments[pathIndex]
    if (segment !== undefined) {
      const segmentParams = matchSegmentTokens(tokens, segment)
      if (segmentParams) {
        const matched = visit(patternIndex + 1, pathIndex + 1, { ...params, ...segmentParams })
        if (matched)
          return matched
      }
    }

    const matched = param?.optional ? visit(patternIndex + 1, pathIndex, params) : null
    if (!matched)
      failedStates.add(state)
    return matched
  }

  return visit(0, 0, {})
}

/** Render a pattern with captured params. Null when a param has no value. */
function fillPagePattern(pattern: string, params: Record<string, string>): string | null {
  const filled: string[] = []
  for (const segment of toSegments(pattern)) {
    const tokens = parsePageSegment(segment)
    let value = ''
    for (const token of tokens) {
      if (token._tag === 'static') {
        value += token.value
        continue
      }
      const paramValue = params[token.param.name]
      if (paramValue === undefined) {
        if (token.param.optional)
          continue
        return null
      }
      value += paramValue
    }
    if (value)
      filled.push(value)
  }
  if (!filled.length)
    return '/'
  return `/${filled.join('/')}${pattern.endsWith('/') ? '/' : ''}`
}

/**
 * Build the known alternates for one matched entry. Unknown paths are omitted
 * instead of fabricating URLs from another locale's translated slug.
 */
function alternatesForEntry(
  localePaths: Record<string, string | false>,
  params: Record<string, string>,
  i18n: RuntimeI18nConfig,
  context: RuntimeRouteContext,
): LocaleAlternate[] | null {
  // Locales the entry doesn't name use the default pattern when available.
  // Without that pattern the original route is unknowable from i18n pages.
  const untranslated = localePaths[i18n.defaultLocale]
  const alternates: LocaleAlternate[] = []
  const defaultLocale = i18n.locales.find(locale => locale.code === i18n.defaultLocale)

  for (const l of i18n.locales) {
    const pattern = localePaths[l.code] ?? untranslated
    // Disabled for this locale: no page, so no alternate.
    if (localePaths[l.code] === false)
      continue
    if (typeof pattern !== 'string')
      continue
    const path = fillPagePattern(pattern, params)
    if (path === null)
      continue
    const domain = resolveCanonicalLocaleDomain(l, defaultLocale)
    alternates.push({
      code: l.code,
      hreflang: l.hreflang || l.code,
      path: localePath(path, l.code, i18n, { host: domain || context.host }),
      ...(domain ? { domain } : {}),
    })
  }

  return alternates.length ? alternates : null
}

/**
 * Resolve alternates from the translated route table.
 *
 * Returns null when the pages map can't answer for this route, in which case
 * the caller falls back to locale-prefix arithmetic.
 */
function alternatesFromPages(
  basePath: string,
  routePath: string,
  locale: string,
  i18n: RuntimeI18nConfig,
  context: RuntimeRouteContext,
): LocaleAlternate[] | null {
  const pages = i18n.pages
  const hasDomainLocales = i18n.differentDomains || i18n.multiDomainLocales
  const hasContextLocale = !!context.locale && i18n.locales.some(locale => locale.code === context.locale)
  if (!pages)
    return null
  const allowLocalized = i18n.strategy !== 'no_prefix' || hasDomainLocales || hasContextLocale

  type PageMatch
    = | { _tag: 'localized', ranks: number[], localePaths: LocalePagePaths, params: Record<string, string> }
      | { _tag: 'unlocalized', ranks: number[] }
  const matches: PageMatch[] = []
  for (const page of Object.values(pages)) {
    if (!page)
      continue
    if (isUnlocalizedLocalePage(page)) {
      if (matchesUnlocalizedLocalePage(page, routePath))
        matches.push({ _tag: 'unlocalized', ranks: segmentRanks(page.path) })
      continue
    }
    if (!allowLocalized)
      continue
    const pattern = page[locale]
    if (!pattern)
      continue
    const params = matchPagePattern(pattern, basePath)
    if (params)
      matches.push({ _tag: 'localized', ranks: segmentRanks(pattern), localePaths: page, params })
  }

  matches.sort((a, b) => compareSpecificity(a.ranks, b.ranks))

  for (const match of matches) {
    if (match._tag === 'unlocalized') {
      const defaultLocale = i18n.locales.find(locale => locale.code === i18n.defaultLocale)
      if (defaultLocale) {
        const domain = resolveLocaleDomain(defaultLocale)
        return [{
          code: defaultLocale.code,
          hreflang: defaultLocale.hreflang || defaultLocale.code,
          path: routePath,
          ...(domain ? { domain } : {}),
        }]
      }
      continue
    }
    const alternates = alternatesForEntry(match.localePaths, match.params, i18n, context)
    if (alternates)
      return alternates
  }

  return null
}

/**
 * Compute hreflang alternates for a given route.
 * Returns the route itself plus all sibling locale variants.
 *
 * Translated slugs (i18n `pages`) can't be derived by adding or removing a
 * locale prefix — `/about` and `/fr/a-propos` are the same page — so the route
 * table is consulted first and prefix arithmetic is the fallback.
 */
export function resolveLocaleAlternates(
  route: string,
  i18n: RuntimeI18nConfig,
  context: RuntimeRouteContext = {},
): LocaleAlternateResolution {
  const { locale, basePath } = resolveLocaleFromRoute(route, i18n, context)
  const { pathname, suffix } = splitRouteSuffix(basePath)
  const { pathname: routePathname } = splitRouteSuffix(route)

  // Whole-route false entries were never localized, so match their raw route
  // before locale-prefix stripping. `/fr/legal` may itself be unlocalized.
  const translated = alternatesFromPages(pathname, routePathname, locale, i18n, context)
  if (translated) {
    return {
      _tag: 'pages',
      alternates: translated.map(alternate => ({ ...alternate, path: `${alternate.path}${suffix}` })),
    }
  }

  const defaultLocale = i18n.locales.find(locale => locale.code === i18n.defaultLocale)
  return {
    _tag: 'strategy',
    alternates: i18n.locales.map((l) => {
      const domain = resolveCanonicalLocaleDomain(l, defaultLocale)
      return {
        code: l.code,
        hreflang: l.hreflang || l.code,
        path: localePath(basePath, l.code, i18n, { host: domain || context.host }),
        ...(domain ? { domain } : {}),
      }
    }),
  }
}

export function computeLocaleAlternates(
  route: string,
  i18n: RuntimeI18nConfig,
  context: RuntimeRouteContext = {},
): LocaleAlternate[] {
  return resolveLocaleAlternates(route, i18n, context).alternates
}

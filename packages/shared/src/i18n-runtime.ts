/**
 * Runtime-safe i18n route resolution.
 *
 * `./i18n` reaches for `@nuxt/kit` to read the installed module's options, so it
 * can only run at build time. This entry carries no build-time dependencies and
 * is importable from a module's runtime (nitro handlers, plugins, composables).
 * Feed it the config `toRuntimeI18nConfig()` produces.
 */

/**
 * Custom route paths keyed by route name, then locale code — i18n's `pages`
 * option (`globalLocaleRoutes` for nuxt-i18n-micro). `false` means the page is
 * disabled for that locale.
 *
 * ```
 * { about: { en: '/about', fr: '/a-propos' } }
 * ```
 */
export type LocalePages = Record<string, Record<string, string | false> | undefined>

/** Runtime-safe subset of `AutoI18nConfig` used for route locale resolution. */
export interface RuntimeI18nConfig {
  defaultLocale: string
  strategy: 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
  locales: Array<{
    code: string
    hreflang: string
    name?: string
    nativeName?: string
  }>
  /** Translated route paths, when i18n is configured with custom routes. */
  pages?: LocalePages
}

export interface LocaleAlternate {
  code: string
  hreflang: string
  path: string
}

export interface RouteLocaleInfo {
  /** Resolved locale code for this route */
  locale: string
  /** Route with locale prefix stripped (e.g. /fr/about → /about). For no_prefix this equals route. */
  basePath: string
}

/**
 * Resolve which locale a route belongs to and the locale-stripped base path.
 */
export function resolveLocaleFromRoute(route: string, i18n: RuntimeI18nConfig): RouteLocaleInfo {
  if (i18n.strategy === 'no_prefix')
    return { locale: i18n.defaultLocale, basePath: route }

  const segments = route.split('/').filter(Boolean)
  const first = segments[0]
  const matched = first ? i18n.locales.find(l => l.code === first) : undefined

  if (matched) {
    const rest = segments.slice(1).join('/')
    return { locale: matched.code, basePath: rest ? `/${rest}` : '/' }
  }

  return { locale: i18n.defaultLocale, basePath: route }
}

/**
 * Build the URL path for a base path under a given locale, honoring the i18n strategy.
 */
export function localePath(basePath: string, locale: string, i18n: RuntimeI18nConfig): string {
  if (i18n.strategy === 'no_prefix')
    return basePath

  const isDefault = locale === i18n.defaultLocale
  if (i18n.strategy === 'prefix_except_default' && isDefault)
    return basePath

  // prefix, prefix_and_default, prefix_except_default (non-default)
  if (basePath === '/' || basePath === '')
    return `/${locale}`
  return `/${locale}${basePath}`
}

function toSegments(path: string): string[] {
  return path.split('/').filter(Boolean)
}

interface PageParam {
  name: string
  catchAll: boolean
  optional: boolean
}

/**
 * Read a dynamic segment: `[slug]`, `[[slug]]`, `[...slug]`, `[[...slug]]` and
 * the router equivalents `:slug`, `:slug?`, `:slug(.*)`.
 */
function readParam(segment: string): PageParam | null {
  if (segment.startsWith('[') && segment.endsWith(']')) {
    let name = segment.slice(1, -1)
    let optional = false
    if (name.startsWith('[') && name.endsWith(']')) {
      name = name.slice(1, -1)
      optional = true
    }
    const catchAll = name.startsWith('...')
    if (catchAll)
      name = name.slice(3)
    // Anything still carrying a bracket isn't a segment we understand.
    if (!name || name.includes('[') || name.includes(']'))
      return null
    return { name, catchAll, optional }
  }
  const colon = /^:([^(?*+]+)([?*+])?(\(\.\*\))?$/.exec(segment)
  if (colon)
    return { name: colon[1]!, catchAll: !!colon[3] || colon[2] === '*', optional: colon[2] === '?' || colon[2] === '*' }
  return null
}

/**
 * Specificity of each segment, most specific first: static beats a param, a
 * param beats a catch-all. Mirrors how the router itself ranks routes, so the
 * order entries happen to be declared in doesn't decide which page a path
 * belongs to.
 */
function segmentRanks(pattern: string): number[] {
  return toSegments(pattern).map((segment) => {
    const param = readParam(segment)
    if (!param)
      return 2
    return param.catchAll ? 0 : 1
  })
}

/** Negative when `a` is more specific than `b`, for use as a sort comparator. */
function compareSpecificity(a: number[], b: number[]): number {
  const length = Math.max(a.length, b.length)
  for (let i = 0; i < length; i++) {
    // A pattern that ran out of segments is the less specific of the two.
    const diff = (b[i] ?? -1) - (a[i] ?? -1)
    if (diff !== 0)
      return diff
  }
  return 0
}

/**
 * Match a route pattern from the pages map against a concrete path, capturing
 * dynamic segments. Returns null when the path belongs to a different route.
 */
function matchPagePattern(pattern: string, path: string): Record<string, string> | null {
  const patternSegments = toSegments(pattern)
  const pathSegments = toSegments(path)
  const params: Record<string, string> = {}

  for (let i = 0; i < patternSegments.length; i++) {
    const param = readParam(patternSegments[i]!)
    if (param?.catchAll) {
      const rest = pathSegments.slice(i)
      if (!rest.length)
        return param.optional ? params : null
      params[param.name] = rest.join('/')
      return params
    }
    const segment = pathSegments[i]
    if (segment === undefined) {
      // The path stopped early: fine only if every segment left is optional.
      return patternSegments.slice(i).every(s => readParam(s)?.optional) ? params : null
    }
    if (param)
      params[param.name] = segment
    else if (patternSegments[i] !== segment)
      return null
  }

  return pathSegments.length === patternSegments.length ? params : null
}

/** Render a pattern with captured params. Null when a param has no value. */
function fillPagePattern(pattern: string, params: Record<string, string>): string | null {
  const filled: string[] = []
  for (const segment of toSegments(pattern)) {
    const param = readParam(segment)
    if (!param) {
      filled.push(segment)
      continue
    }
    const value = params[param.name]
    if (value === undefined) {
      if (param.optional)
        continue
      return null
    }
    filled.push(value)
  }
  return filled.length ? `/${filled.join('/')}` : '/'
}

/**
 * Build the alternates for one matched entry, or null when a locale the entry
 * does name can't be rendered from the captured params.
 */
function alternatesForEntry(
  localePaths: Record<string, string | false>,
  params: Record<string, string>,
  basePath: string,
  i18n: RuntimeI18nConfig,
): LocaleAlternate[] | null {
  // Locales the entry doesn't name keep the untranslated route path, which the
  // table doesn't record. The default locale's pattern is the closest thing to
  // it we have; without one, fall back to the path that was requested.
  const untranslated = localePaths[i18n.defaultLocale]
  const alternates: LocaleAlternate[] = []

  for (const l of i18n.locales) {
    const pattern = localePaths[l.code] ?? untranslated
    // Disabled for this locale: no page, so no alternate.
    if (localePaths[l.code] === false)
      continue
    const path = typeof pattern === 'string' ? fillPagePattern(pattern, params) : basePath
    if (path === null)
      return null
    alternates.push({
      code: l.code,
      hreflang: l.hreflang || l.code,
      path: localePath(path, l.code, i18n),
    })
  }

  return alternates
}

/**
 * Resolve alternates from the translated route table.
 *
 * Returns null when the pages map can't answer for this route, in which case
 * the caller falls back to locale-prefix arithmetic.
 */
function alternatesFromPages(basePath: string, locale: string, i18n: RuntimeI18nConfig): LocaleAlternate[] | null {
  // no_prefix gives every locale the same single URL, so there is nothing to
  // translate between.
  const pages = i18n.pages
  if (!pages || i18n.strategy === 'no_prefix')
    return null

  const matches: Array<{ ranks: number[], localePaths: Record<string, string | false>, params: Record<string, string> }> = []
  for (const localePaths of Object.values(pages)) {
    const pattern = localePaths?.[locale]
    if (!pattern)
      continue
    const params = matchPagePattern(pattern, basePath)
    if (params)
      matches.push({ ranks: segmentRanks(pattern), localePaths, params })
  }

  matches.sort((a, b) => compareSpecificity(a.ranks, b.ranks))

  for (const match of matches) {
    const alternates = alternatesForEntry(match.localePaths, match.params, basePath, i18n)
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
export function computeLocaleAlternates(route: string, i18n: RuntimeI18nConfig): LocaleAlternate[] {
  const { locale, basePath } = resolveLocaleFromRoute(route, i18n)

  const translated = alternatesFromPages(basePath, locale, i18n)
  if (translated)
    return translated

  return i18n.locales.map(l => ({
    code: l.code,
    hreflang: l.hreflang || l.code,
    path: localePath(basePath, l.code, i18n),
  }))
}

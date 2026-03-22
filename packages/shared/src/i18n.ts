import type { LocaleObject, NuxtI18nOptions } from '@nuxtjs/i18n'
import { getNuxtModuleVersion, hasNuxtModule, hasNuxtModuleCompatibility } from '@nuxt/kit'
import { joinURL, withBase, withHttps, withLeadingSlash } from 'ufo'
import { getNuxtModuleOptions } from './kit'

const SLASH_PATTERN = /^\/|\/$/g

export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'

export interface AutoI18nConfig {
  locales: LocaleObject[]
  defaultLocale: string
  strategy: Strategies
  differentDomains?: boolean
  pages?: Record<string, Record<string, string | false>>
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
  let path = pageLocales
  switch (forcedStrategy ?? nuxtI18nConfig.strategy) {
    case 'prefix_except_default':
    case 'prefix_and_default':
      path = localeCode === nuxtI18nConfig.defaultLocale ? pageLocales : joinURL(localeCode, pageLocales)
      break
    case 'prefix':
      path = joinURL(localeCode, pageLocales)
      break
  }
  return locale?.domain ? withHttps(withBase(path, locale.domain)) : path
}

export function splitPathForI18nLocales(path: string, autoI18n: AutoI18nConfig): string | string[] {
  const locales = autoI18n.strategy === 'prefix_except_default'
    ? autoI18n.locales.filter(l => l.code !== autoI18n.defaultLocale)
    : autoI18n.locales
  if (!path || path.startsWith('/_'))
    return path

  const hasLocalePrefix = locales.some(l => path.startsWith(`/${l.code}/`) || path === `/${l.code}`)
  if (hasLocalePrefix)
    return path
  return [
    path,
    ...locales.map(l => `/${l.code}${path}`),
  ]
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

export function mapPathForI18nPages(path: string, autoI18n: AutoI18nConfig): string[] | false {
  const pages = autoI18n.pages
  if (!pages || !Object.keys(pages).length)
    return false

  const withoutSlashes = path.replace(SLASH_PATTERN, '').replace('/index', '')

  function resolveForAllLocales(pageName: string, pageLocales: Record<string, string | false>): string[] {
    return autoI18n.locales
      .filter((l) => {
        if (l.code in pageLocales && pageLocales[l.code] === false)
          return false
        if (autoI18n.strategy === 'prefix_except_default' && l.code === autoI18n.defaultLocale)
          return false
        return true
      })
      .map((l) => {
        const localePath = (l.code in pageLocales && pageLocales[l.code] !== false)
          ? pageLocales[l.code] as string
          : `/${pageName}`
        return withLeadingSlash(generatePathForI18nPages({
          localeCode: l.code,
          pageLocales: localePath,
          nuxtI18nConfig: { strategy: autoI18n.strategy, defaultLocale: autoI18n.defaultLocale } as NuxtI18nOptions,
          normalisedLocales: autoI18n.locales,
        }))
      })
  }

  if (withoutSlashes in pages) {
    const pageLocales = pages[withoutSlashes]
    if (pageLocales)
      return resolveForAllLocales(withoutSlashes, pageLocales)
  }

  for (const [pageName, pageLocales] of Object.entries(pages)) {
    if (!pageLocales)
      continue
    if (autoI18n.defaultLocale in pageLocales && pageLocales[autoI18n.defaultLocale] === path)
      return resolveForAllLocales(pageName, pageLocales)
  }

  return false
}

export async function resolveI18nConfig(logger?: { warn: (msg: string) => void }): Promise<false | AutoI18nConfig> {
  if (!hasNuxtModule('@nuxtjs/i18n'))
    return false

  const i18nVersion = await getNuxtModuleVersion('@nuxtjs/i18n')
  if (!await hasNuxtModuleCompatibility('@nuxtjs/i18n', '>=8')) {
    logger?.warn(`You are using @nuxtjs/i18n v${i18nVersion}. For the best compatibility, please upgrade to @nuxtjs/i18n v8.0.0 or higher.`)
  }

  const nuxtI18nConfig = (await getNuxtModuleOptions('@nuxtjs/i18n') || {}) as NuxtI18nOptions
  const normalisedLocales = normalizeLocales(nuxtI18nConfig)
  const usingI18nPages = Object.keys(nuxtI18nConfig.pages || {}).length
  const hasI18nConfigForAlternatives = nuxtI18nConfig.differentDomains || usingI18nPages || (nuxtI18nConfig.strategy !== 'no_prefix' && nuxtI18nConfig.locales)
  if (!hasI18nConfigForAlternatives)
    return false

  return {
    differentDomains: nuxtI18nConfig.differentDomains,
    defaultLocale: nuxtI18nConfig.defaultLocale!,
    locales: normalisedLocales,
    strategy: nuxtI18nConfig.strategy as Strategies,
    pages: nuxtI18nConfig.pages as Record<string, Record<string, string | false>> | undefined,
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

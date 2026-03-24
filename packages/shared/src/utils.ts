import { createRouter, toRouteMatcher } from 'radix3'

export interface CreateFilterOptions {
  include?: (string | RegExp)[]
  exclude?: (string | RegExp)[]
}

export function createFilter(options: CreateFilterOptions = {}): (path: string) => boolean {
  const include = options.include || []
  const exclude = options.exclude || []
  if (include.length === 0 && exclude.length === 0)
    return () => true

  const excludeRegex = exclude.filter(r => r instanceof RegExp) as RegExp[]
  const includeRegex = include.filter(r => r instanceof RegExp) as RegExp[]
  const excludeStrings = exclude.filter(r => typeof r === 'string') as string[]
  const includeStrings = include.filter(r => typeof r === 'string') as string[]

  const excludeMatcher = excludeStrings.length > 0
    ? toRouteMatcher(createRouter({
        routes: Object.fromEntries(excludeStrings.map(r => [r, true])),
        strictTrailingSlash: false,
      }))
    : null
  const includeMatcher = includeStrings.length > 0
    ? toRouteMatcher(createRouter({
        routes: Object.fromEntries(includeStrings.map(r => [r, true])),
        strictTrailingSlash: false,
      }))
    : null

  const excludeExact = new Set(excludeStrings)
  const includeExact = new Set(includeStrings)

  return function (path: string): boolean {
    if (excludeRegex.some(r => r.test(path)))
      return false
    if (excludeExact.has(path))
      return false
    if (excludeMatcher && excludeMatcher.matchAll(path).length > 0)
      return false

    if (includeRegex.some(r => r.test(path)))
      return true
    if (includeExact.has(path))
      return true
    if (includeMatcher && includeMatcher.matchAll(path).length > 0)
      return true

    return include.length === 0
  }
}

export function withoutQuery(path: string): string {
  return path.split('?')[0]
}

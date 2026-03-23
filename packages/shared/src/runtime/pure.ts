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

  // Pre-compute regex and string rules once
  const excludeRegex = exclude.filter(r => r instanceof RegExp) as RegExp[]
  const includeRegex = include.filter(r => r instanceof RegExp) as RegExp[]
  const excludeStrings = exclude.filter(r => typeof r === 'string') as string[]
  const includeStrings = include.filter(r => typeof r === 'string') as string[]

  // Pre-create routers once (expensive operation)
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

  // Pre-create Sets for O(1) exact match lookups
  const excludeExact = new Set(excludeStrings)
  const includeExact = new Set(includeStrings)

  return function (path: string): boolean {
    // Check exclude rules first
    if (excludeRegex.some(r => r.test(path)))
      return false
    if (excludeExact.has(path))
      return false
    if (excludeMatcher && excludeMatcher.matchAll(path).length > 0)
      return false

    // Check include rules
    if (includeRegex.some(r => r.test(path)))
      return true
    if (includeExact.has(path))
      return true
    if (includeMatcher && includeMatcher.matchAll(path).length > 0)
      return true

    return include.length === 0
  }
}

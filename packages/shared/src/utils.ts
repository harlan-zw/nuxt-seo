import type { ConsolaInstance } from 'consola'
import { createConsola } from 'consola'
import { createRouter, toRouteMatcher } from 'radix3'

export interface SerializedRegExp {
  regex: string
}

export interface SourceFlagsRegExp {
  source: string
  flags?: string
}

export type FilterEntry = string | RegExp
export type SerializedFilterEntry = string | SerializedRegExp | SourceFlagsRegExp
export type FilterEntryInput = FilterEntry | SerializedRegExp | SourceFlagsRegExp

function parseSerializedRegExp(value: string): RegExp {
  const lastSlash = value.lastIndexOf('/')
  return new RegExp(value.slice(1, lastSlash), value.slice(lastSlash + 1))
}

export function serializeFilters(filters: unknown[], tag?: string): SerializedFilterEntry[] {
  const prefix = tag ? `[${tag}] ` : ''
  const result: SerializedFilterEntry[] = []
  for (const filter of filters) {
    if (filter instanceof RegExp) {
      result.push({ regex: filter.toString() })
      continue
    }
    if (typeof filter === 'string') {
      result.push(filter)
      continue
    }
    if (filter && typeof filter === 'object' && typeof (filter as SerializedRegExp).regex === 'string') {
      result.push(filter as SerializedRegExp)
      continue
    }
    if (filter && typeof filter === 'object' && typeof (filter as SourceFlagsRegExp).source === 'string') {
      result.push(filter as SourceFlagsRegExp)
      continue
    }
    console.warn(`${prefix}You have provided an invalid filter: ${filter}, ignoring.`)
  }
  return result
}

export function deserializeFilters(filters: FilterEntryInput[]): FilterEntry[] {
  return filters.map((filter) => {
    if (filter instanceof RegExp || typeof filter === 'string')
      return filter
    if (typeof (filter as SerializedRegExp).regex === 'string')
      return parseSerializedRegExp((filter as SerializedRegExp).regex)
    if (typeof (filter as SourceFlagsRegExp).source === 'string')
      return new RegExp((filter as SourceFlagsRegExp).source, (filter as SourceFlagsRegExp).flags || '')
    return filter as FilterEntry
  })
}

export interface CreateFilterOptions {
  include?: FilterEntryInput[]
  exclude?: FilterEntryInput[]
}

export function createFilter(options: CreateFilterOptions = {}): (path: string) => boolean {
  const include = deserializeFilters(options.include || [])
  const exclude = deserializeFilters(options.exclude || [])
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
  return path.split('?')[0]!
}

export function createModuleLogger(tag: string, debug?: boolean): ConsolaInstance {
  return createConsola({ level: debug ? 4 : 3, defaults: { tag } })
}

/**
 * Contract for `#nuxtseo/content`, the per-provider runtime shim that
 * `setupContentRuntime()` aliases into the Nitro bundle.
 *
 * `@nuxt/content` and `comark-content` cannot both be imported by one build:
 * pulling `@nuxt/content/server` into an app that does not have it fails the
 * bundle. So provider choice is a build-time alias, and every consumer imports
 * this one specifier instead of naming a package.
 */

export type ContentRuntimeProvider = 'nuxt-content-v3' | 'comark' | 'none'

/**
 * A queryable page collection, normalized across providers.
 *
 * The two manifests disagree in shape. `@nuxt/content` keys an object by name and
 * carries a schema-derived `fields` map. comark returns an array and carries a
 * per-collection sitemap flag. Both reduce to this.
 */
export interface PageCollection {
  name: string
  /**
   * Whether the collection declares `field`.
   *
   * For `@nuxt/content` this is the schema opt in, so a module can require its own
   * field before claiming the collection. comark derives no field list from a
   * schema, so it answers `true` and relies on frontmatter being present or absent.
   */
  hasField: (field: string) => boolean
  /** `false` only when the collection opted out of the sitemap. */
  inSitemap: boolean
}

export interface ContentPageQuery {
  where: (field: string, operator: string, value?: unknown) => ContentPageQuery
  select: (...fields: string[]) => ContentPageQuery
  all: () => Promise<Record<string, any>[]>
  first: () => Promise<Record<string, any> | null>
}

export interface ContentRuntime {
  provider: ContentRuntimeProvider
  listPageCollections: (event: unknown) => Promise<PageCollection[]>
  queryPages: (event: unknown, collection: string) => ContentPageQuery
}

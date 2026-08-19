import type { ContentPageQuery, ContentRuntimeProvider, PageCollection } from '../../content-runtime'
import { queryCollection, queryCollectionManifest } from '@harlan-zw/comark-content/server'

export const provider: ContentRuntimeProvider = 'comark'

export async function listPageCollections(event: unknown): Promise<PageCollection[]> {
  const manifest = await queryCollectionManifest(event)
  return manifest.map(entry => ({
    name: entry.name,
    // comark derives no field list from a schema, so every field is available to ask
    // for. A collection opts out of the sitemap on the collection itself.
    hasField: () => true,
    inSitemap: entry.sitemap,
  }))
}

/**
 * comark's query builder gained `IS NOT NULL` in 0.1.4. Translate it into a
 * post-filter so one caller works against every supported comark.
 *
 * Every operation is buffered rather than forwarded on call, so the caller can
 * order `where` and `select` however it likes: a post-filtered field has to survive
 * the projection to be readable, and that is only known once the chain ends.
 */
export function queryPages(event: unknown, collection: string): ContentPageQuery {
  const wheres: [string, string, unknown][] = []
  let selected: string[] | undefined

  const query: ContentPageQuery = {
    where(field, operator, value) {
      wheres.push([field, operator, value])
      return query
    },
    select(...fields) {
      selected = fields
      return query
    },
    async all() {
      const notNull = wheres.filter(([, operator]) => operator === 'IS NOT NULL').map(([field]) => field)
      const builder = queryCollection(event, collection)
      for (const [field, operator, value] of wheres) {
        if (operator !== 'IS NOT NULL')
          builder.where(field, operator as Parameters<typeof builder.where>[1], value)
      }
      if (selected)
        builder.select(...new Set([...selected, ...notNull]))
      const rows = await builder.all() as Record<string, any>[]
      return rows.filter(row => notNull.every(field => row[field] !== null && row[field] !== undefined))
    },
    async first() {
      return (await query.all())[0] ?? null
    },
  }
  return query
}

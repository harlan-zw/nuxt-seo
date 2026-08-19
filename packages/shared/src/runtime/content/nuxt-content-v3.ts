import type { ContentPageQuery, ContentRuntimeProvider, PageCollection } from '../../content-runtime'
import { queryCollection } from '@nuxt/content/server'
// @ts-expect-error virtual module provided by @nuxt/content
import manifest from '#content/manifest'

export const provider: ContentRuntimeProvider = 'nuxt-content-v3'

export async function listPageCollections(_event: unknown): Promise<PageCollection[]> {
  return Object.entries(manifest as Record<string, { fields?: Record<string, unknown> }>)
    .map(([name, entry]) => ({
      name,
      hasField: (field: string) => !!entry.fields && field in entry.fields,
      // @nuxt/content has no collection level sitemap opt out. The schema field is
      // the opt in, which `hasField` answers.
      inSitemap: true,
    }))
}

export function queryPages(event: unknown, collection: string): ContentPageQuery {
  return queryCollection(event as never, collection as never) as unknown as ContentPageQuery
}

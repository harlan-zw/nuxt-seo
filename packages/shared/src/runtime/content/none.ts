import type { ContentPageQuery, ContentRuntimeProvider, PageCollection } from '../../content-runtime'

export const provider: ContentRuntimeProvider = 'none'

export async function listPageCollections(_event: unknown): Promise<PageCollection[]> {
  return []
}

/**
 * Never reached: every caller enumerates collections first and gets none.
 * Present so the specifier resolves and consumers import it unconditionally.
 */
export function queryPages(_event: unknown, collection: string): ContentPageQuery {
  throw new Error(`No content module is installed, so collection "${collection}" cannot be queried.`)
}

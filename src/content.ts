import type { Collection } from '@nuxt/content'
import { asRobotsCollection } from '@nuxtjs/robots/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import { asOgImageCollection } from 'nuxt-og-image/content'
import { asSchemaOrgCollection } from 'nuxt-schema-org/content'

export function asSeoCollection<T>(collection: Collection<T>): Collection<T> {
  // run collection through fns
  const fns = [asOgImageCollection, asSchemaOrgCollection, asRobotsCollection, asSitemapCollection]
  return fns.reduce((collection, fn) => fn(collection), collection)
}

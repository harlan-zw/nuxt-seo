import type { Collection } from '@nuxt/content'
import { asRobotsCollection, defineRobotsSchema } from '@nuxtjs/robots/content'
import { asSitemapCollection, defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { asOgImageCollection, defineOgImageSchema } from 'nuxt-og-image/content'
import { asSchemaOrgCollection, defineSchemaOrgSchema } from 'nuxt-schema-org/content'

export { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema }

/**
 * @deprecated Use `defineRobotsSchema()`, `defineSitemapSchema()`, `defineOgImageSchema()`, and `defineSchemaOrgSchema()` from each module instead.
 * See https://nuxtseo.com/docs/nuxt-seo/guides/nuxt-content
 */
export function asSeoCollection<T>(collection: Collection<T>): Collection<T> {
  console.warn('[nuxt-seo] `asSeoCollection()` is deprecated. Import `defineXxxSchema()` from each module and compose them in your collection schema instead. See https://nuxtseo.com/docs/nuxt-seo/guides/nuxt-content')
  const fns = [asOgImageCollection, asSchemaOrgCollection, asRobotsCollection, asSitemapCollection]
  return fns.reduce((collection, fn) => fn(collection), collection)
}

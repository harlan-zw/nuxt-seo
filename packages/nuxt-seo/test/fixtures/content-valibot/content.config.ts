import { defineCollection, defineContentConfig } from '@nuxt/content'
import * as v from 'valibot'
import { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '../../../src/content-valibot'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: v.object({
        draft: v.optional(v.boolean()),
        head: v.optional(v.object({
          script: v.optional(v.array(v.looseObject({}))),
        })),
        robots: defineRobotsSchema(),
        sitemap: defineSitemapSchema({
          name: 'content',
          filter: entry => !entry.draft,
          onUrl: (url, entry) => {
            if (entry.path === '/' && entry.sitemap?.lastmod?.startsWith('2025-10-01'))
              url.loc = '/featured'
          },
        }),
        ogImage: defineOgImageSchema(),
        schemaOrg: defineSchemaOrgSchema(),
      }),
    }),
  },
})

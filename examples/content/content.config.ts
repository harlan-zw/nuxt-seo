import { defineCollection, defineContentConfig } from '@nuxt/content'
import { defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } from '@nuxtjs/seo/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
      schema: z.object({
        date: z.string().optional(),
        sitemap: defineSitemapSchema({ z }),
        robots: defineRobotsSchema({ z }),
        schemaOrg: defineSchemaOrgSchema({ z }),
      }),
    }),
  },
})

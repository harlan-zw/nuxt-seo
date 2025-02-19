import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { asSeoCollection } from '../../../src/content'

export default defineContentConfig({
  collections: {
    content: defineCollection(
      asSeoCollection({
        type: 'page',
        source: '**/*.md',
        schema: z.object({
          date: z.string().optional(),
        }),
      }),
    ),
  },
})

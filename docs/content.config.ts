import { defineCollection } from '@nuxt/content'
import { resolve } from 'pathe'

export const collections = {
  docs: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('.content'),
      prefix: 'docs',
    },
  }),
}

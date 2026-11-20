import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import * as v from 'valibot'

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'zod' || specifier.startsWith('zod/'))
      throw new Error('The Valibot entry point imported Zod.')
    return next(specifier, context)
  },
})

const { defineOgImageSchema, defineRobotsSchema, defineSchemaOrgSchema, defineSitemapSchema } = await import('@nuxtjs/seo/content/valibot')

const schema = v.object({
  robots: defineRobotsSchema(),
  sitemap: defineSitemapSchema(),
  ogImage: defineOgImageSchema(),
  schemaOrg: defineSchemaOrgSchema(),
})

const entry = {
  robots: false,
  sitemap: { priority: 0.8 },
  ogImage: { component: 'ContentCard', props: { title: 'Hello' } },
  schemaOrg: [{ '@type': 'Person', 'name': 'Valibot Author' }],
}

assert.deepEqual(v.parse(schema, entry), entry)

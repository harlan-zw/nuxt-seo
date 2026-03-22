import type { z as zodLib } from 'zod'

type ZodInstance = typeof zodLib
type ZodTypeAny = zodLib.ZodTypeAny

export interface ContentSchemaOptions {
  /**
   * Pass the `z` instance from `@nuxt/content` to ensure `.editor()` works
   * across Zod versions. When omitted, the module's bundled `z` is used.
   */
  z?: ZodInstance
}

export interface ContentEditorConfig {
  hidden?: boolean
  input?: 'media' | 'icon' | 'textarea'
  iconLibraries?: string[]
}

/**
 * Apply Nuxt Content `.editor()` metadata to a zod schema field.
 * No-ops gracefully when `.editor()` is not patched onto ZodType (outside Nuxt Content).
 */
export function withEditor<T extends ZodTypeAny>(schema: T, config: ContentEditorConfig): T {
  if (typeof (schema as any).editor === 'function')
    return (schema as any).editor(config)
  return schema
}

/**
 * Hide a zod schema field from the Nuxt Content / Studio editor.
 * Only use for fields that genuinely don't work in a form (freeform JSON, deeply nested arrays).
 */
export function withEditorHidden<T extends ZodTypeAny>(schema: T): T {
  return withEditor(schema, { hidden: true })
}

export interface DefineContentSchemaConfig<TSchema extends ZodTypeAny> {
  /**
   * The field name used in frontmatter (e.g. 'robots', 'sitemap', 'ogImage').
   */
  fieldName: string
  /**
   * Build the zod schema for this field. Receives the zod instance
   * (either the user's `@nuxt/content` patched version or the module's bundled one).
   */
  buildSchema: (z: ZodInstance) => TSchema
  /**
   * Module label for deprecation warnings (e.g. 'robots', 'sitemap').
   */
  label: string
  /**
   * Documentation URL for migration guidance.
   */
  docsUrl?: string
}

/**
 * Factory for creating a module's `define*Schema()` and deprecated `as*Collection()` exports.
 *
 * Each module provides its own schema builder. The factory handles:
 * - Zod instance passthrough for `@nuxt/content` version compatibility
 * - Consistent `DefineSchemaOptions` interface
 * - Deprecated `asXxxCollection()` wrapper with migration warning
 *
 * @example
 * // In @nuxtjs/robots/content.ts
 * import { z } from 'zod'
 * import { createContentSchemaFactory } from 'nuxtseo-shared/content'
 *
 * const { defineSchema, asCollection, schema } = createContentSchemaFactory({
 *   fieldName: 'robots',
 *   label: 'robots',
 *   docsUrl: 'https://nuxtseo.com/robots/guides/content',
 *   buildSchema: (z) => z.enum(['index, follow', 'noindex', 'nofollow', 'noindex, nofollow', 'none']).optional(),
 * }, z)
 *
 * export { defineSchema as defineRobotsSchema, asCollection as asRobotsCollection, schema }
 */
// eslint-disable-next-line ts/explicit-function-return-type
export function createContentSchemaFactory<TSchema extends ZodTypeAny>(
  config: DefineContentSchemaConfig<TSchema>,
  defaultZ: ZodInstance,
) {
  const { fieldName, buildSchema, label, docsUrl } = config

  const defaultSchema = buildSchema(defaultZ)
  const schemaObject = defaultZ.object({ [fieldName]: defaultSchema })

  function defineSchema(options?: ContentSchemaOptions): TSchema {
    const _z = options?.z ?? defaultZ
    if (_z === defaultZ)
      return defaultSchema
    return buildSchema(_z)
  }

  function asCollection<T>(collection: any): T {
    const migrationHint = docsUrl
      ? ` See ${docsUrl}`
      : ''
    console.warn(`[${label}] \`as${capitalize(label)}Collection()\` is deprecated. Use \`define${capitalize(label)}Schema()\` in your collection schema instead.${migrationHint}`)
    if (collection.type === 'page') {
      collection.schema = collection.schema
        ? schemaObject.extend(collection.schema.shape)
        : schemaObject
    }
    return collection
  }

  return {
    defineSchema,
    asCollection,
    schema: schemaObject,
    fieldSchema: defaultSchema,
  }
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

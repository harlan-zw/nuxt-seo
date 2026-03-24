import type { Zod } from '../../src/content'
import { describe, expect, it, vi } from 'vitest'
import { createContentSchemaFactory, withEditor, withEditorHidden } from '../../src/content'

// Minimal zod mock that supports .object(), .string(), .optional(), .union(), .extend()
function createMockZ() {
  const field = (value?: any) => ({
    value,
    optional: () => field({ ...value, optional: true }),
    editor: vi.fn(function (this: any, config: any) {
      return { ...this, editorConfig: config }
    }),
  })

  return {
    string: () => field({ type: 'string' }),
    boolean: () => field({ type: 'boolean' }),
    union: (schemas: any[]) => field({ type: 'union', schemas }),
    object: (shape: Record<string, any>) => ({
      shape,
      extend: (otherShape: Record<string, any>) => ({
        shape: { ...shape, ...otherShape },
      }),
    }),
  } as unknown as Zod
}

// -------------------------------------------------------------------
// withEditor
// -------------------------------------------------------------------
describe('withEditor', () => {
  it('calls .editor() when available on schema', () => {
    const schema = {
      editor: vi.fn((config: any) => ({ ...config, applied: true })),
    }
    const result = withEditor(schema, { hidden: true })
    expect(schema.editor).toHaveBeenCalledWith({ hidden: true })
    expect(result).toEqual({ hidden: true, applied: true })
  })

  it('returns schema unchanged when .editor() is not available', () => {
    const schema = { type: 'string' }
    const result = withEditor(schema, { hidden: true })
    expect(result).toBe(schema)
  })

  it('passes input config through', () => {
    const schema = {
      editor: vi.fn((config: any) => config),
    }
    withEditor(schema, { input: 'media' })
    expect(schema.editor).toHaveBeenCalledWith({ input: 'media' })
  })
})

// -------------------------------------------------------------------
// withEditorHidden
// -------------------------------------------------------------------
describe('withEditorHidden', () => {
  it('calls withEditor with hidden: true', () => {
    const schema = {
      editor: vi.fn((config: any) => config),
    }
    const result = withEditorHidden(schema)
    expect(schema.editor).toHaveBeenCalledWith({ hidden: true })
    expect(result).toEqual({ hidden: true })
  })

  it('no-ops when .editor() is missing', () => {
    const schema = { type: 'string' }
    expect(withEditorHidden(schema)).toBe(schema)
  })
})

// -------------------------------------------------------------------
// createContentSchemaFactory
// -------------------------------------------------------------------
describe('createContentSchemaFactory', () => {
  it('returns defineSchema, asCollection, schema, and fieldSchema', () => {
    const z = createMockZ()
    const result = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string().optional(),
      },
      z,
    )
    expect(result).toHaveProperty('defineSchema')
    expect(result).toHaveProperty('asCollection')
    expect(result).toHaveProperty('schema')
    expect(result).toHaveProperty('fieldSchema')
    expect(typeof result.defineSchema).toBe('function')
    expect(typeof result.asCollection).toBe('function')
  })

  it('defineSchema returns default schema when called without options', () => {
    const z = createMockZ()
    const { defineSchema, fieldSchema } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string().optional(),
      },
      z,
    )
    expect(defineSchema()).toBe(fieldSchema)
  })

  it('defineSchema calls buildSchema with custom z when provided', () => {
    const defaultZ = createMockZ()
    const customZ = createMockZ()
    const buildSchema = vi.fn((_z: Zod) => _z.string())

    const { defineSchema } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema,
      },
      defaultZ,
    )

    defineSchema({ z: customZ })
    // buildSchema called with customZ (not defaultZ) on the second call
    expect(buildSchema).toHaveBeenCalledWith(customZ)
  })

  it('defineSchema returns cached schema when z matches default', () => {
    const z = createMockZ()
    const { defineSchema, fieldSchema } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
      },
      z,
    )
    expect(defineSchema({ z })).toBe(fieldSchema)
  })

  it('defineSchema calls onDefineSchema when options provided', () => {
    const z = createMockZ()
    const onDefineSchema = vi.fn()
    const { defineSchema } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
        onDefineSchema,
      },
      z,
    )

    const options = { z }
    defineSchema(options)
    expect(onDefineSchema).toHaveBeenCalledWith(options)
  })

  it('asCollection warns about deprecation', () => {
    const z = createMockZ()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { asCollection } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
        docsUrl: 'https://example.com/docs',
      },
      z,
    )

    asCollection({ type: 'page' })
    expect(warnSpy).toHaveBeenCalledOnce()
    expect(warnSpy.mock.calls[0][0]).toContain('deprecated')
    expect(warnSpy.mock.calls[0][0]).toContain('https://example.com/docs')
    warnSpy.mockRestore()
  })

  it('asCollection extends page collection schema', () => {
    const z = createMockZ()
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { asCollection } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
      },
      z,
    )

    const collection = { type: 'page', schema: z.object({ title: z.string() }) }
    const result = asCollection(collection) as any
    expect(result.schema.shape).toHaveProperty('robots')
    expect(result.schema.shape).toHaveProperty('title')

    vi.restoreAllMocks()
  })

  it('asCollection sets schema when collection has none', () => {
    const z = createMockZ()
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { asCollection } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
      },
      z,
    )

    const collection = { type: 'page' } as any
    const result = asCollection(collection) as any
    expect(result.schema.shape).toHaveProperty('robots')

    vi.restoreAllMocks()
  })

  it('asCollection returns non-page collections unchanged (except warning)', () => {
    const z = createMockZ()
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const { asCollection } = createContentSchemaFactory(
      {
        fieldName: 'robots',
        label: 'robots',
        buildSchema: _z => _z.string(),
      },
      z,
    )

    const collection = { type: 'data' } as any
    const result = asCollection(collection) as any
    expect(result.schema).toBeUndefined()

    vi.restoreAllMocks()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { createFilter, createModuleLogger, deserializeFilters, serializeFilters } from '../../src/utils'

describe('createModuleLogger', () => {
  it('defaults to level 3 (info)', () => {
    const logger = createModuleLogger('test-tag')
    expect(logger.level).toBe(3)
  })

  it('uses level 4 (debug) when debug is true', () => {
    const logger = createModuleLogger('test-tag', true)
    expect(logger.level).toBe(4)
  })

  it('uses level 3 when debug is false', () => {
    const logger = createModuleLogger('test-tag', false)
    expect(logger.level).toBe(3)
  })

  it('tags the logger with the given tag', () => {
    const logger = createModuleLogger('my-module')
    expect(logger.options.defaults.tag).toBe('my-module')
  })
})

describe('createFilter', () => {
  it('allows everything when no filters are provided', () => {
    const filter = createFilter()
    expect(filter('/foo')).toBe(true)
    expect(filter('/bar/baz')).toBe(true)
  })

  it('matches string routes for include', () => {
    const filter = createFilter({ include: ['/foo', '/bar/**'] })
    expect(filter('/foo')).toBe(true)
    expect(filter('/bar/baz')).toBe(true)
    expect(filter('/baz')).toBe(false)
  })

  it('matches string routes for exclude', () => {
    const filter = createFilter({ exclude: ['/foo', '/bar/**'] })
    expect(filter('/foo')).toBe(false)
    expect(filter('/bar/baz')).toBe(false)
    expect(filter('/baz')).toBe(true)
  })

  it('matches RegExp instances for include', () => {
    const filter = createFilter({ include: [/^\/foo/] })
    expect(filter('/foo')).toBe(true)
    expect(filter('/bar')).toBe(false)
  })

  it('matches RegExp instances for exclude', () => {
    const filter = createFilter({ exclude: [/^\/foo/] })
    expect(filter('/foo')).toBe(false)
    expect(filter('/bar')).toBe(true)
  })

  it('exclude takes priority over include', () => {
    const filter = createFilter({ include: ['/foo/**'], exclude: ['/foo/bar'] })
    expect(filter('/foo/baz')).toBe(true)
    expect(filter('/foo/bar')).toBe(false)
  })

  it('accepts serialized { regex } entries', () => {
    const filter = createFilter({ include: [{ regex: '/^\\/foo/i' }] })
    expect(filter('/FOO')).toBe(true)
    expect(filter('/bar')).toBe(false)
  })

  it('accepts serialized { source, flags } entries', () => {
    const filter = createFilter({ exclude: [{ source: '^\\/foo', flags: 'i' }] })
    expect(filter('/FOO')).toBe(false)
    expect(filter('/bar')).toBe(true)
  })
})

describe('serializeFilters', () => {
  it('passes strings through unchanged', () => {
    expect(serializeFilters(['/foo'])).toEqual(['/foo'])
  })

  it('converts RegExp to canonical { regex } form', () => {
    expect(serializeFilters([/^\/foo/gi])).toEqual([{ regex: '/^\\/foo/gi' }])
  })

  it('round-trips through JSON.stringify', () => {
    const serialized = serializeFilters([/^\/foo/i, '/bar'])
    const json = JSON.parse(JSON.stringify(serialized))
    const deserialized = deserializeFilters(json)
    expect(deserialized[0]).toBeInstanceOf(RegExp)
    expect((deserialized[0] as RegExp).source).toBe('^\\/foo')
    expect((deserialized[0] as RegExp).flags).toBe('i')
    expect(deserialized[1]).toBe('/bar')
  })

  it('drops invalid entries and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = serializeFilters([123, '/ok'])
    expect(result).toEqual(['/ok'])
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]![0]).toContain('invalid filter')
    warn.mockRestore()
  })

  it('prefixes the warning with the given tag', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    serializeFilters([null], 'my-module')
    expect(warn.mock.calls[0]![0]).toContain('[my-module]')
    warn.mockRestore()
  })
})

describe('deserializeFilters', () => {
  it('passes strings and RegExp through unchanged', () => {
    const regex = /^\/foo/
    const result = deserializeFilters(['/foo', regex])
    expect(result[0]).toBe('/foo')
    expect(result[1]).toBe(regex)
  })

  it('parses { regex } canonical entries', () => {
    const [result] = deserializeFilters([{ regex: '/^\\/foo/gi' }])
    expect(result).toBeInstanceOf(RegExp)
    expect((result as RegExp).source).toBe('^\\/foo')
    expect((result as RegExp).flags).toBe('gi')
  })

  it('parses { source, flags } legacy entries', () => {
    const [result] = deserializeFilters([{ source: '^\\/foo', flags: 'i' }])
    expect(result).toBeInstanceOf(RegExp)
    expect((result as RegExp).source).toBe('^\\/foo')
    expect((result as RegExp).flags).toBe('i')
  })

  it('parses { source } entries without flags', () => {
    const [result] = deserializeFilters([{ source: '^\\/foo' }])
    expect(result).toBeInstanceOf(RegExp)
    expect((result as RegExp).flags).toBe('')
  })
})

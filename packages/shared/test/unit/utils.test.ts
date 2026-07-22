import { describe, expect, it } from 'vitest'
import { createModuleLogger } from '../../src/utils'

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

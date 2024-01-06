import { describe, expect, it } from 'vitest'
import { pathBreadcrumbSegments } from '../../src/runtime/pure/breadcrumbs'

describe('breadcrumbs', () => {
  it('basic', async () => {
    const items = pathBreadcrumbSegments('/x/y', '/')
    expect(items).toMatchInlineSnapshot(`
      [
        "/",
        "/x",
        "/x/y",
      ]
    `)
  })
  it('empty root node', async () => {
    const items = pathBreadcrumbSegments('/x/y', '')
    expect(items).toMatchInlineSnapshot(`
      [
        "/",
        "/x",
        "/x/y",
      ]
    `)
  })
  it('custom root node', async () => {
    const items = pathBreadcrumbSegments('/x/y', '/x')
    expect(items).toMatchInlineSnapshot(`
      [
        "/x",
        "/x/y",
      ]
    `)
  })
  it('broken root node', async () => {
    const items = pathBreadcrumbSegments('/x/y', '/foo')
    expect(items).toMatchInlineSnapshot(`
      [
        "/",
        "/x",
        "/x/y",
      ]
    `)
  })
})

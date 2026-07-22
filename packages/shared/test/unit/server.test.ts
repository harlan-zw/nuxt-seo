import { describe, expect, it, vi } from 'vitest'

function rc(routeRules: Record<string, any>, baseURL = '/') {
  return { nitro: { routeRules }, app: { baseURL } } as any
}

async function importMatcher() {
  vi.resetModules()
  return import('../../src/server')
}

describe('createNitroRouteRuleMatcher', () => {
  it('merges overlapping rules with defu precedence, more specific wins', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher(rc({
      '/blog/**': { headers: { a: '1' }, redirect: '/generic' },
      '/blog/post/**': { headers: { a: '2', b: '3' } },
    }))
    expect(match('/blog/post/abc')).toEqual({ headers: { a: '2', b: '3' }, redirect: '/generic' })
  })

  it('strips the baseURL before matching', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }, '/base'))
    expect(match('/base/foo')).toEqual({ redirect: '/x' })
  })

  it('strips trailing slash and query string', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    expect(match('/foo/?a=1')).toEqual({ redirect: '/x' })
  })

  it('resolves a full URL input against the baseURL', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    expect(match('https://example.com/foo?x=1')).toEqual({ redirect: '/x' })
  })

  it('caches the matcher across calls made without an event, ignoring later config', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const first = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    const second = createNitroRouteRuleMatcher(rc({ '/bar': { redirect: '/y' } }))
    expect(second).toBe(first)
    expect(second('/bar')).toEqual({})
    expect(second('/foo')).toEqual({ redirect: '/x' })
  })

  it('never uses or populates the cache when an event is passed', async () => {
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const event = { context: {} } as any
    const withEvent = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }), event)
    const withEvent2 = createNitroRouteRuleMatcher(rc({ '/bar': { redirect: '/y' } }), event)
    expect(withEvent2).not.toBe(withEvent)
    expect(withEvent2('/bar')).toEqual({ redirect: '/y' })
    const globalMatch = createNitroRouteRuleMatcher(rc({ '/baz': { redirect: '/z' } }))
    expect(globalMatch('/baz')).toEqual({ redirect: '/z' })
  })
})

import { describe, expect, it } from 'vitest'
import { createNitroRouteRuleMatcher } from '../../src/server'

function rc(routeRules: Record<string, any>, baseURL = '/') {
  return { nitro: { routeRules }, app: { baseURL } } as any
}

describe('createNitroRouteRuleMatcher', () => {
  it('merges overlapping rules with defu precedence, more specific wins', () => {
    const match = createNitroRouteRuleMatcher(rc({
      '/blog/**': { headers: { a: '1' }, redirect: '/generic' },
      '/blog/post/**': { headers: { a: '2', b: '3' } },
    }))
    expect(match('/blog/post/abc')).toEqual({ headers: { a: '2', b: '3' }, redirect: '/generic' })
  })

  it('strips the baseURL before matching', () => {
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }, '/base'))
    expect(match('/base/foo')).toEqual({ redirect: '/x' })
  })

  it('strips trailing slash and query string', () => {
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    expect(match('/foo/?a=1')).toEqual({ redirect: '/x' })
  })

  it('resolves a full URL input against the baseURL', () => {
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    expect(match('https://example.com/foo?x=1')).toEqual({ redirect: '/x' })
  })

  it('returns an empty object when no rule matches', () => {
    const match = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    expect(match('/bar')).toEqual({})
  })

  it('builds an independent matcher per call from the given config', () => {
    const first = createNitroRouteRuleMatcher(rc({ '/foo': { redirect: '/x' } }))
    const second = createNitroRouteRuleMatcher(rc({ '/bar': { redirect: '/y' } }))
    expect(first('/foo')).toEqual({ redirect: '/x' })
    expect(first('/bar')).toEqual({})
    expect(second('/bar')).toEqual({ redirect: '/y' })
    expect(second('/foo')).toEqual({})
  })
})

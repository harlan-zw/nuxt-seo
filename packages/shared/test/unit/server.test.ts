import { beforeEach, describe, expect, it, vi } from 'vitest'

const useRuntimeConfigMock = vi.fn()

vi.mock('nitropack/runtime', () => ({
  useRuntimeConfig: (...args: any[]) => useRuntimeConfigMock(...args),
}))

function mockConfig(routeRules: Record<string, any>, baseURL = '/') {
  useRuntimeConfigMock.mockReturnValue({ nitro: { routeRules }, app: { baseURL } })
}

async function importMatcher() {
  vi.resetModules()
  return import('../../src/server')
}

beforeEach(() => {
  useRuntimeConfigMock.mockReset()
})

describe('createNitroRouteRuleMatcher', () => {
  it('merges overlapping rules with defu precedence, more specific wins', async () => {
    mockConfig({
      '/blog/**': { headers: { a: '1' }, redirect: '/generic' },
      '/blog/post/**': { headers: { a: '2', b: '3' } },
    })
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher()
    expect(match('/blog/post/abc')).toEqual({ headers: { a: '2', b: '3' }, redirect: '/generic' })
  })

  it('strips the baseURL before matching', async () => {
    mockConfig({ '/foo': { redirect: '/x' } }, '/base')
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher()
    expect(match('/base/foo')).toEqual({ redirect: '/x' })
  })

  it('strips trailing slash and query string', async () => {
    mockConfig({ '/foo': { redirect: '/x' } })
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher()
    expect(match('/foo/?a=1')).toEqual({ redirect: '/x' })
  })

  it('resolves a full URL input against the baseURL', async () => {
    mockConfig({ '/foo': { redirect: '/x' } })
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const match = createNitroRouteRuleMatcher()
    expect(match('https://example.com/foo?x=1')).toEqual({ redirect: '/x' })
  })

  it('caches the matcher across calls made without an event', async () => {
    mockConfig({ '/foo': { redirect: '/x' } })
    const { createNitroRouteRuleMatcher } = await importMatcher()
    createNitroRouteRuleMatcher()
    createNitroRouteRuleMatcher()
    createNitroRouteRuleMatcher()
    expect(useRuntimeConfigMock).toHaveBeenCalledTimes(1)
  })

  it('never uses or populates the cache when an event is passed', async () => {
    mockConfig({ '/foo': { redirect: '/x' } })
    const { createNitroRouteRuleMatcher } = await importMatcher()
    const event = { context: {} } as any

    createNitroRouteRuleMatcher()
    createNitroRouteRuleMatcher(event)
    createNitroRouteRuleMatcher(event)
    createNitroRouteRuleMatcher()

    expect(useRuntimeConfigMock).toHaveBeenCalledTimes(3)
    expect(useRuntimeConfigMock).toHaveBeenNthCalledWith(2, event)
    expect(useRuntimeConfigMock).toHaveBeenNthCalledWith(3, event)
  })
})

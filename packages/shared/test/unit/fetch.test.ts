import type { RequestEvent } from 'nuxt/schema'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchWithEvent } from '../../src/fetch'

const { serverFetch } = vi.hoisted(() => ({ serverFetch: vi.fn() }))
vi.mock('nuxt/server', () => ({ serverFetch }))
const event = { req: new Request('https://app.example.test/source'), context: {} } as Pick<RequestEvent, 'req' | 'context'>
afterEach(() => {
  serverFetch.mockReset()
  vi.unstubAllGlobals()
})
describe('fetchWithEvent', () => {
  it('uses local transport with ofetch query and response parsing', async () => {
    serverFetch.mockResolvedValue(Response.json({ total: 12 }))
    await expect(fetchWithEvent(event, '/internal', { query: { page: 2 } })).resolves.toEqual({ total: 12 })
    expect(serverFetch).toHaveBeenCalledWith(event, '/internal?page=2', expect.any(Object))
  })
  it('retries temporary local failures', async () => {
    serverFetch.mockResolvedValueOnce(Response.json({ error: 'busy' }, { status: 503 })).mockResolvedValueOnce(Response.json({ ready: true }))
    await expect(fetchWithEvent(event, '/internal')).resolves.toEqual({ ready: true })
    expect(serverFetch).toHaveBeenCalledTimes(2)
  })
  it('uses native fetch for external requests', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ remote: true }))
    vi.stubGlobal('fetch', fetch)
    await expect(fetchWithEvent(event, 'https://remote.example.test/data')).resolves.toEqual({ remote: true })
    expect(fetch).toHaveBeenCalledOnce()
    expect(serverFetch).not.toHaveBeenCalled()
  })
  it('resolves protocol-relative sources against the request scheme without using local transport', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ remote: true }))
    vi.stubGlobal('fetch', fetch)
    await expect(fetchWithEvent(event, '//remote.example.test/data')).resolves.toEqual({ remote: true })
    expect(fetch.mock.calls[0]![0]).toBe('https://remote.example.test/data')
    expect(serverFetch).not.toHaveBeenCalled()
  })
  it('preserves explicit authorization', async () => {
    serverFetch.mockResolvedValue(Response.json({ allowed: true }))
    await fetchWithEvent(event, '/private', { headers: { authorization: 'Bearer fixture' } })
    expect(new Headers(serverFetch.mock.calls[0]![2].headers).get('authorization')).toBe('Bearer fixture')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { collectSetupDebugData, createHomepageSetupCheck } from '../../src/runtime/server/utils/setup'

describe('homepage setup check', () => {
  it('checks a configured localized home after a root redirect, but skips other pages', () => {
    const run = vi.fn(async () => {})
    const check = createHomepageSetupCheck('/app/', run, vi.fn(), ['/app/', '/app/en', '/app/fr'])
    check({ path: '/app/', status: 302, contentType: 'text/html' })
    check({ path: '/app/de', status: 200, contentType: 'text/html' })
    check({ path: '/app/en/about', status: 200, contentType: 'text/html' })
    expect(run).not.toHaveBeenCalled()
    check({ path: '/app/en/', status: 200, contentType: 'text/html' })
    check({ path: '/app/fr', status: 200, contentType: 'text/html' })
    expect(run).toHaveBeenCalledTimes(1)
  })
  it('starts once after successful HTML at the app home, without waiting for checks', async () => {
    const run = vi.fn(() => new Promise<void>(() => {}))
    const check = createHomepageSetupCheck('/app/', run, vi.fn())
    check({ path: '/app/about', status: 200, contentType: 'text/html' })
    check({ path: '/app/', status: 500, contentType: 'text/html' })
    check({ path: '/app/', status: 200, contentType: 'application/json' })
    expect(run).not.toHaveBeenCalled()
    check({ path: '/app/?preview=1', status: 200, contentType: 'text/html; charset=utf-8' })
    check({ path: '/app', status: 200, contentType: 'text/html' })
    expect(run).toHaveBeenCalledTimes(1)
  })

  it('surfaces background failure once', async () => {
    const failure = new Error('check failed')
    const report = vi.fn()
    const check = createHomepageSetupCheck('/', () => Promise.reject(failure), report)
    check({ path: '/', status: 200, contentType: 'text/html' })
    await vi.waitFor(() => expect(report).toHaveBeenCalledWith(failure))
    check({ path: '/', status: 200, contentType: 'text/html' })
    expect(report).toHaveBeenCalledTimes(1)
  })
})

describe('setup debug collection', () => {
  it('fetches active modules only, preserves app base and separates unavailable data', async () => {
    const fetch = vi.fn(async (path: string) => {
      if (path.includes('robots'))
        throw new Error('endpoint missing')
      return { config: { url: 'https://example.com' } }
    })
    const result = await collectSetupDebugData({
      installedModuleSlugs: new Set(['site-config', 'robots', 'og-image']),
      disabledModuleSlugs: new Set(['og-image']),
      baseURL: '/app/',
      fetch,
      timeout: 30,
    })
    expect(fetch.mock.calls.map(call => call[0])).toEqual(['/app/__site-config__/debug.json', '/app/__robots__/debug.json'])
    expect(result.get('site-config')).toEqual({ config: { url: 'https://example.com' } })
    expect(result.has('robots')).toBe(false)
    expect(result.has('og-image')).toBe(false)
  })

  it('bounds checks when an endpoint never settles', async () => {
    const result = await collectSetupDebugData({
      installedModuleSlugs: new Set(['site-config']),
      baseURL: '/',
      fetch: () => new Promise(() => {}),
      timeout: 10,
    })
    expect(result.has('site-config')).toBe(false)
  })
})

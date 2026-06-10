import { describe, expect, it, vi } from 'vitest'
import { createDevtoolsHost } from '../composables/host'

describe('createDevtoolsHost', () => {
  it('degrades safely on a malformed host', () => {
    // The exact failure mode behind #544: the host shape is not what an older
    // @nuxt/devtools version provided. None of these accessors may throw.
    const host = createDevtoolsHost({ host: {}, devtools: {} } as any)
    expect(host.fetch).toBeUndefined()
    expect(host.route).toBeUndefined()
    expect(host.baseURL).toBe('/')
    expect(host.inject('usehead')).toBeUndefined()
    expect(host.rpc('x', {})).toBeUndefined()
    expect(() => host.openInEditor('/some/file.vue')).not.toThrow()
  })

  it('handles a fully absent client', () => {
    const host = createDevtoolsHost(undefined)
    expect(host.baseURL).toBe('/')
    expect(host.inject(Symbol('k'))).toBeUndefined()
    expect(host.rpc('x', {})).toBeUndefined()
  })

  it('resolves provides from either the app context or the root instance', () => {
    const usehead = { resolveTags: () => [] }
    const fromContext = createDevtoolsHost({
      host: { nuxt: { vueApp: { _context: { provides: { usehead } } } } },
    } as any)
    expect(fromContext.inject('usehead')).toBe(usehead)

    const fromInstance = createDevtoolsHost({
      host: { nuxt: { vueApp: { _instance: { appContext: { provides: { usehead } } } } } },
    } as any)
    expect(fromInstance.inject('usehead')).toBe(usehead)
  })

  it('reads the host fetch, router route and base url when present', () => {
    const $fetch = vi.fn()
    const currentRoute = { value: { path: '/foo' } }
    const host = createDevtoolsHost({
      host: {
        app: { $fetch },
        nuxt: { $config: { app: { baseURL: '/app/' } }, $router: { currentRoute } },
      },
    } as any)
    expect(host.fetch).toBe($fetch)
    expect(host.route).toBe(currentRoute)
    expect(host.baseURL).toBe('/app/')
  })

  it('opens a birpc channel and forwards openInEditor through the devtools rpc', () => {
    const extendClientRpc = vi.fn(() => ({ connected: vi.fn() }))
    const openInEditor = vi.fn()
    const host = createDevtoolsHost({
      host: {},
      devtools: { extendClientRpc, rpc: { openInEditor } },
    } as any)
    const handlers = { updated() {} }
    host.rpc('ns', handlers)
    expect(extendClientRpc).toHaveBeenCalledWith('ns', handlers)
    host.openInEditor('/x.vue')
    expect(openInEditor).toHaveBeenCalledWith('/x.vue')
  })
})

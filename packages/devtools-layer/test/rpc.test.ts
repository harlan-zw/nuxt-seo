import { describe, expect, it, vi } from 'vitest'
import { useDevtoolsConnection } from '../composables/rpc'

const bridge = vi.hoisted(() => ({
  connected: undefined as undefined | ((client: any) => Promise<void>),
  base: { value: '/' },
}))

vi.mock('@nuxt/devtools-kit/iframe-client', () => ({
  useDevtoolsClient() {},
  onDevtoolsClientConnected(callback: typeof bridge.connected) {
    bridge.connected = callback
  },
}))

vi.mock('../composables/state', () => ({
  base: bridge.base,
  isConnected: { value: false },
  path: { value: '/' },
  query: { value: undefined },
  refreshSources() {},
  standaloneUrl: { value: '' },
}))

describe('useDevtoolsConnection', () => {
  it('connects when the host has no usable route subscription', async () => {
    useDevtoolsConnection()
    await bridge.connected!({
      host: {
        app: { colorMode: { value: 'light' } },
        nuxt: { $config: { app: { baseURL: '/example/' } }, $router: { afterEach: {} } },
      },
      devtools: {},
    })
    expect(bridge.base.value).toBe('/example/')
  })

  it('registers a route subscription and its unmount cleanup', async () => {
    const remove = vi.fn()
    const afterEach = vi.fn(() => remove)
    const hook = vi.fn()
    useDevtoolsConnection()
    await bridge.connected!({
      host: {
        app: { colorMode: { value: 'light' } },
        nuxt: { $router: { afterEach }, hook },
      },
      devtools: {},
    })
    expect(afterEach).toHaveBeenCalledOnce()
    expect(hook).toHaveBeenCalledWith('app:unmount', remove)
  })
})

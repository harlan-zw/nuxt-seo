import type { Nuxt } from '@nuxt/schema'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setupNitroRuntimeCompatibility } from '../../src/kit'

const { getNitroVersion, addTypeTemplate, hookOnce, resolveModule, warn } = vi.hoisted(() => ({
  getNitroVersion: vi.fn(),
  addTypeTemplate: vi.fn(),
  hookOnce: vi.fn(),
  resolveModule: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('@nuxt/kit', async importOriginal => ({
  ...await importOriginal<typeof import('@nuxt/kit')>(),
  getNitroVersion,
  addTypeTemplate,
  resolveModule,
  useLogger: () => ({ warn }),
}))
function createNuxt(): Nuxt {
  return { hooks: { hookOnce }, options: { modulesDir: ['/project/node_modules'], nitro: {} } } as unknown as Nuxt
}
beforeEach(() => {
  vi.clearAllMocks()
  resolveModule.mockImplementation((id: string) => `/resolved/${id}.mjs`)
})
describe('setupNitroRuntimeCompatibility', () => {
  it('uses the Nitro version instead of the framework version', () => {
    getNitroVersion.mockReturnValue(3)
    const nuxt = createNuxt()
    const result = setupNitroRuntimeCompatibility(nuxt)
    expect(result._tag).toBe('nitro-v3')
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('nitro/h3')
    expect(nuxt.options.nitro.externals).toBeUndefined()
  })
  it('inlines the shared package for the supported Nitro2 builder', () => {
    getNitroVersion.mockReturnValue(2)
    const nuxt = createNuxt()
    setupNitroRuntimeCompatibility(nuxt)
    setupNitroRuntimeCompatibility(nuxt)
    expect(nuxt.options.nitro.externals?.inline).toEqual(['nuxtseo-shared'])
    expect(addTypeTemplate).toHaveBeenCalledOnce()
    expect(hookOnce).toHaveBeenCalledOnce()
  })
  it('preserves Nitro3 inline choices while including portable shared imports', () => {
    getNitroVersion.mockReturnValue(3)
    const nuxt = createNuxt()
    const options = nuxt.options.nitro as typeof nuxt.options.nitro & { noExternals?: boolean | string[] }
    options.noExternals = ['another-runtime']
    setupNitroRuntimeCompatibility(nuxt)
    setupNitroRuntimeCompatibility(nuxt)
    expect(options.noExternals).toEqual(['another-runtime', 'nuxtseo-shared'])
  })
  it('preserves a Nitro3 configuration that already bundles all packages', () => {
    getNitroVersion.mockReturnValue(3)
    const nuxt = createNuxt()
    const options = nuxt.options.nitro as typeof nuxt.options.nitro & { noExternals?: boolean }
    options.noExternals = true
    setupNitroRuntimeCompatibility(nuxt)
    expect(options.noExternals).toBe(true)
  })
  it('refuses an unknown builder before registering compatibility hooks', () => {
    getNitroVersion.mockReturnValue(undefined)
    expect(() => setupNitroRuntimeCompatibility(createNuxt())).toThrow('Nitro 2 or Nitro 3')
    expect(hookOnce).not.toHaveBeenCalled()
  })
  it('reapplies aliases after module setup', () => {
    getNitroVersion.mockReturnValue(3)
    const nuxt = createNuxt()
    setupNitroRuntimeCompatibility(nuxt)
    nuxt.options.nitro.alias!['#nuxtseo/h3'] = 'incorrect-builder'
    hookOnce.mock.calls[0]![1]()
    expect(nuxt.options.nitro.alias?.['#nuxtseo/h3']).toBe('nitro/h3')
  })
  it('reports an unresolved runtime at the final setup boundary', () => {
    getNitroVersion.mockReturnValue(2)
    resolveModule.mockImplementation(() => {
      throw new Error('missing runtime')
    })
    setupNitroRuntimeCompatibility(createNuxt())
    expect(warn).not.toHaveBeenCalled()
    hookOnce.mock.calls[0]![1]()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('h3'), expect.any(Error))
  })
  it.each([
    [2, 'nitropack', 'h3'],
    [3, 'nitro', 'nitro/h3'],
  ])('resolves a nested Nitro %s runtime without hoisting', (major, builder, runtime) => {
    getNitroVersion.mockReturnValue(major)
    resolveModule.mockImplementation((id: string, options: { url: URL[] }) => {
      if (id === 'ofetch')
        return '/native/ofetch/index.mjs'
      if (id === 'nuxt')
        return '/native/nuxt/index.mjs'
      if (id === builder && options.url.some(url => url.href === 'file:///native/nuxt/index.mjs'))
        return `/native/${builder}/index.mjs`
      if (id === runtime && options.url.some(url => url.href === `file:///native/${builder}/index.mjs`))
        return '/native/server-runtime/index.mjs'
      throw new Error('The dependency exists only inside its native package.')
    })
    const nuxt = createNuxt()
    setupNitroRuntimeCompatibility(nuxt)
    expect(nuxt.options.nitro.typescript?.tsConfig?.compilerOptions?.paths?.['#nuxtseo/h3']).toEqual(['/native/server-runtime/index.mjs'])
  })
})

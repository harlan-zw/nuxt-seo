import type { $Fetch } from 'ofetch'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createFetch } from 'ofetch'

interface Renderer {
  options: {
    builder?: string | false
    output: { serverDir: string }
    rollupConfig?: { output?: { entryFileNames?: unknown } }
  }
}

interface PrerenderTransport {
  fetch: typeof globalThis.fetch
  close: () => Promise<void>
}

type PrerenderGroup
  = | { _tag: 'open', users: number, major: 2 | 3, transport: Promise<PrerenderTransport> | undefined }
    | { _tag: 'closed' }

// The generated module is cached by Node. Modules sharing its renderer must share its lifetime too.
const groups = new WeakMap<Renderer, PrerenderGroup>()

function parseResponse(value: unknown): Response {
  if (!(value instanceof Response))
    throw new Error('The Nitro prerender app returned an invalid response.')
  return value
}

/** Open the generated prerender app after Nitro 3 has closed its own worker. */
export function createPrerenderFetch(renderer: Renderer, nitroMajor: 2 | 3): { fetch: $Fetch, close: () => Promise<void> } {
  const group = groups.get(renderer) ?? { _tag: 'open', users: 0, major: nitroMajor, transport: undefined }
  if (group._tag === 'closed')
    throw new Error('The prerender app has already closed.')
  if (group.major !== nitroMajor)
    throw new Error('Modules must use the same prerender builder.')
  group.users++
  groups.set(renderer, group)
  let lease: 'active' | 'released' = 'active'
  const open = async (): Promise<PrerenderTransport> => {
    if (renderer.options.builder === false)
      throw new Error('Prerender requests require a compiled Nitro app.')
    const entryFileNames = renderer.options.rollupConfig?.output?.entryFileNames
    const entry = resolve(renderer.options.output.serverDir, typeof entryFileNames === 'string' ? entryFileNames : 'index.mjs')
    // This import loads the selected builder's generated app, not a package fallback.
    const exports: unknown = await import(pathToFileURL(entry).href)
    if (typeof exports !== 'object' || exports === null)
      throw new Error('The prerender app has invalid exports.')
    const module = exports as Record<string, unknown>
    if (nitroMajor === 2) {
      const localFetch = module.localFetch
      if (typeof localFetch !== 'function')
        throw new Error('The Nitro 2 prerender app does not export localFetch.')
      return { fetch: async (input, init) => parseResponse(await localFetch(input, init)), close: async () => {} }
    }
    const app = module.default
    if (typeof app !== 'object' || app === null || !('fetch' in app) || !('close' in app))
      throw new Error('The Nitro 3 prerender app does not export fetch and close.')
    const fetch = app.fetch
    const close = app.close
    if (typeof fetch !== 'function' || typeof close !== 'function')
      throw new Error('The Nitro 3 prerender app does not export fetch and close.')
    return {
      fetch: async input => parseResponse(await fetch(input)),
      close: async () => {
        await close()
      },
    }
  }
  const fetch = createFetch({
    fetch: async (input, init) => {
      if (lease === 'released')
        throw new Error('This prerender client has already closed.')
      if (typeof input !== 'string' || (!input.startsWith('/') || input.startsWith('//')))
        return globalThis.fetch(input, init)
      group.transport ||= open()
      const app = await group.transport
      return nitroMajor === 2
        ? app.fetch(input, init)
        : app.fetch(new Request(new URL(input, 'http://localhost'), init))
    },
  })
  return { fetch, close: async () => {
    if (lease === 'released')
      return
    lease = 'released'
    group.users--
    if (group.users === 0) {
      groups.set(renderer, { _tag: 'closed' })
      if (group.transport)
        await (await group.transport).close()
    }
  } }
}

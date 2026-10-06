import type { RequestEvent } from 'nuxt/schema'
import type { FetchOptions, FetchRequest, ResponseType } from 'ofetch'
import { serverFetch } from 'nuxt/server'
import { createFetch } from 'ofetch'

/** Preserve ofetch options while using Nuxt's in-process transport for local app routes. */
export function fetchWithEvent<T>(event: Pick<RequestEvent, 'req' | 'context'>, request: FetchRequest, options?: FetchOptions): Promise<T> {
  const client = createFetch({
    fetch: (input, init) => {
      if (typeof input === 'string' && input.startsWith('//'))
        return globalThis.fetch(new URL(input, event.req.url).href, init)
      return typeof input === 'string' && input.startsWith('/')
        ? serverFetch(event, input, init)
        : globalThis.fetch(input, init)
    },
  })
  return client<T, ResponseType>(request, options) as Promise<T>
}

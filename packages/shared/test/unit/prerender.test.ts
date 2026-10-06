import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { createPrerenderFetch } from '../../src/prerender'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

it('keeps the shared prerender app open until every module releases it', async () => {
  const serverDir = await mkdtemp(join(tmpdir(), 'nuxtseo-prerender-'))
  roots.push(serverDir)
  await writeFile(join(serverDir, 'index.mts'), `let closed = false
export default {
  fetch: async (_request: Request) => Response.json({ ready: !closed }),
  close: async () => { closed = true },
}
`)
  const renderer = { options: { output: { serverDir }, rollupConfig: { output: { entryFileNames: 'index.mts' } } } }
  const first = createPrerenderFetch(renderer, 3)
  const second = createPrerenderFetch(renderer, 3)
  await expect(first.fetch('/first')).resolves.toEqual({ ready: true })
  await first.close()
  await expect(second.fetch('/second')).resolves.toEqual({ ready: true })
  await second.close()
  await expect(second.fetch('/closed', { retry: false })).rejects.toThrow('already closed')
})

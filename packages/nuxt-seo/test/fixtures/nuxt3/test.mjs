import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import process from 'node:process'

async function getFreePort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.notEqual(typeof address, 'string')
  server.close()
  await once(server, 'close')
  return address.port
}

async function waitForServer(server, origin) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`Nuxt 3 server exited with code ${server.exitCode}`)

    const response = await fetch(`${origin}/api/compat`, {
      signal: AbortSignal.timeout(1_000),
    }).catch((error) => {
      if (error instanceof TypeError || error?.name === 'TimeoutError')
        return null
      throw error
    })
    if (response?.ok)
      return

    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 3 server did not start')
}

async function fetchText(origin, path) {
  const response = await fetch(`${origin}${path}`)
  assert.equal(response.status, 200, `${path} returned ${response.status}`)
  return response.text()
}

async function checkSeoOutput(origin, mode) {
  const compat = await fetch(`${origin}/api/compat`)
  assert.deepEqual(await compat.json(), { marker: 'nuxt-3' })
  const internal = await fetch(`${origin}/api/internal-fetch`)
  assert.equal(internal.status, 200)
  assert.match((await internal.json()).body, /<h1>Nuxt SEO compatibility<\/h1>/)

  const html = await fetchText(origin, '/')
  assert.match(html, /<h1>Nuxt SEO compatibility<\/h1>/)
  assert.match(html, /<meta name="description" content="Nuxt SEO compatibility fixture\."/)
  assert.match(html, /<script type="application\/ld\+json"/)

  const robots = await fetchText(origin, '/robots.txt')
  if (mode === 'dev')
    assert.match(robots, /Disallow: \//)
  else
    assert.match(robots, /Sitemap: https:\/\/compat\.example\.com\/sitemap\.xml/)
  const sitemap = await fetchText(origin, '/sitemap.xml')
  assert.match(sitemap, mode === 'dev' ? new RegExp(`<loc>${origin}/</loc>`) : /https:\/\/compat\.example\.com/)

  const imageUrl = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1]
  assert.ok(imageUrl, 'Rendered page is missing its og:image meta tag')
  const imagePath = new URL(imageUrl)
  const imageResponse = await fetch(`${origin}${imagePath.pathname}${imagePath.search}`, {
    headers: { 'x-og-image-test': 'forwarded' },
  })
  assert.equal(imageResponse.status, 200, `OG image returned ${imageResponse.status}`)
  assert.equal(imageResponse.headers.get('content-type'), 'image/png')
  const image = Buffer.from(await imageResponse.arrayBuffer())
  assert.ok(image.byteLength > 1_000, 'Rendered OG image is unexpectedly small')
  assert.equal(image.subarray(1, 4).toString(), 'PNG')
}

async function checkServer(command, args, mode) {
  const port = await getFreePort()
  const origin = `http://127.0.0.1:${port}`
  const server = spawn(command, args(port), {
    cwd: import.meta.dirname,
    detached: process.platform !== 'win32',
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
    stdio: 'inherit',
  })

  try {
    await waitForServer(server, origin)
    await checkSeoOutput(origin, mode)
  }
  finally {
    if (server.exitCode === null) {
      const exited = once(server, 'exit')
      if (process.platform === 'win32')
        server.kill()
      else
        process.kill(-server.pid, 'SIGTERM')
      await exited
    }
  }
}

await checkServer('pnpm', port => ['exec', 'nuxt', 'dev', '--host', '127.0.0.1', '--port', String(port)], 'dev')
await checkServer(process.execPath, () => ['.output/server/index.mjs'], 'production')

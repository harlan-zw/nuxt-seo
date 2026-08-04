import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import process from 'node:process'

const fixtureDir = import.meta.dirname

async function run(command, args) {
  const child = spawn(command, args, {
    cwd: fixtureDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  for (const stream of [child.stdout, child.stderr]) {
    stream.on('data', (chunk) => {
      const text = chunk.toString()
      output += text
      process.stdout.write(text)
    })
  }
  const [exitCode] = await once(child, 'exit')
  assert.equal(exitCode, 0, `${command} ${args.join(' ')} exited with code ${exitCode}`)
  return output
}

async function getFreePort() {
  const portServer = createServer()
  portServer.listen(0, '127.0.0.1')
  await once(portServer, 'listening')
  const address = portServer.address()
  assert.notEqual(typeof address, 'string')
  const port = address.port
  portServer.close()
  await once(portServer, 'close')
  return port
}

async function readServerBundle() {
  const outputDir = new URL('.output/server/', import.meta.url)
  const entries = await readdir(outputDir, {
    recursive: true,
    withFileTypes: true,
  })
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.mjs'))
    .map(entry => readFile(resolve(entry.parentPath, entry.name), 'utf8'))
  return (await Promise.all(files)).join('\n')
}

async function waitForServer(server, origin) {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`Nuxt 5 server exited with code ${server.exitCode}`)

    const response = await fetch(`${origin}/api/compat`, {
      signal: AbortSignal.timeout(1_000),
    }).catch((error) => {
      // Refused connections and timeouts are expected while the server starts.
      if (error instanceof TypeError || error?.name === 'TimeoutError')
        return null
      throw error
    })
    if (response?.ok)
      return response

    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 5 server did not start')
}

async function fetchText(origin, path) {
  const response = await fetch(`${origin}${path}`)
  assert.equal(response.status, 200, `${path} returned ${response.status}`)
  return response.text()
}

async function main() {
  const buildOutput = await run('nuxt', ['build'])
  assert.doesNotMatch(
    buildOutput,
    /\[UNRESOLVED_IMPORT\]|Could not resolve ['"](?:nitropack\/runtime|h3)['"]/,
    'Nuxt 5 build emitted a legacy Nitro import warning',
  )

  const nitroManifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))
  assert.equal(nitroManifest.versions.nitro, '3.0.260610-beta')
  assert.doesNotMatch(await readServerBundle(), /nitropack\/runtime/)

  const port = await getFreePort()
  const origin = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: fixtureDir,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
    },
    stdio: 'inherit',
  })

  try {
    const compatResponse = await waitForServer(server, origin)
    assert.deepEqual(await compatResponse.json(), { marker: 'nitro-3' })

    const internalFetchResponse = await fetch(`${origin}/api/internal-fetch`)
    assert.equal(internalFetchResponse.status, 200)
    const internalFetch = await internalFetchResponse.json()
    assert.equal(internalFetch.status, 200)
    assert.match(internalFetch.body, /Nuxt SEO Nitro 3 compatibility/)

    const html = await fetchText(origin, '/')
    assert.match(html, /<title>Compatibility \| Nuxt SEO Nitro 3<\/title>/)
    assert.match(html, /Nuxt SEO running on Nitro 3\./)
    assert.match(html, /<script type="application\/ld\+json"/)

    const robots = await fetchText(origin, '/robots.txt')
    assert.match(robots, /User-agent:/)
    assert.match(robots, /Sitemap: https:\/\/nitro3\.example\.com\/sitemap\.xml/)

    const sitemap = await fetchText(origin, '/sitemap.xml')
    assert.match(sitemap, /<urlset/)
    assert.match(sitemap, /https:\/\/nitro3\.example\.com\//)

    const llms = await fetchText(origin, '/llms.txt')
    assert.match(llms, /# Nuxt SEO Nitro 3/)

    const markdown = await fetchText(origin, '/index.md')
    assert.match(markdown, /Nuxt SEO Nitro 3 compatibility/)

    const healthResponse = await fetch(`${origin}/__skew/health`)
    assert.equal(healthResponse.status, 200)
    const health = await healthResponse.json()
    assert.equal(health.ok, true)
    assert.equal(typeof health.version, 'string')

    const documentResponse = await fetch(origin, {
      headers: { 'sec-fetch-dest': 'document' },
    })
    assert.match(documentResponse.headers.get('set-cookie') ?? '', /__nkpv=/)

    const imageUrl = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)?.[1]
    assert.ok(imageUrl, 'Rendered page is missing its og:image meta tag')
    const parsedImageUrl = new URL(imageUrl)
    const imageResponse = await fetch(`${origin}${parsedImageUrl.pathname}${parsedImageUrl.search}`, {
      headers: { 'x-og-image-test': 'forwarded' },
    })
    assert.equal(imageResponse.status, 200)
    assert.equal(imageResponse.headers.get('content-type'), 'image/png')
    assert.ok((await imageResponse.arrayBuffer()).byteLength > 1_000, 'Rendered OG image is unexpectedly small')
  }
  finally {
    server.kill()
    if (server.exitCode === null)
      await once(server, 'exit')
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

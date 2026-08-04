import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { once } from 'node:events'
import { readdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { resolve } from 'node:path'
import process from 'node:process'

const HEAD_REGEX = /<head>([\s\S]*)<\/head>/
const STYLE_REGEX = /<style[\s\S]*?<\/style>/g
const SCRIPT_REGEX = /<script[\s\S]*?<\/script>/g
const LINK_REGEX = /<link[\s\S]*?>/g
const TAG_GAP_REGEX = /></g
const OG_IMAGE_REGEX = /<meta property="og:image" content="([^"]+)">/
const OG_SIGNATURE_REGEX = /,s_[\w-]+(?=\.(?:png|jpe?g|webp|svg|html|json))/g
const fixtureRoot = resolve(import.meta.dirname, '..')

const runtimes = [
  {
    dir: resolve(fixtureRoot, 'nitro2'),
    marker: 'nitro-2',
    nitroMajor: 2,
  },
  {
    dir: resolve(fixtureRoot, 'nuxt5'),
    marker: 'nitro-3',
    nitroMajor: 3,
  },
]

async function run(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
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

async function readServerBundle(fixtureDir) {
  const outputDir = resolve(fixtureDir, '.output/server')
  const entries = await readdir(outputDir, {
    recursive: true,
    withFileTypes: true,
  })
  const files = entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.mjs'))
    .map(entry => readFile(resolve(entry.parentPath, entry.name), 'utf8'))
  return (await Promise.all(files)).join('\n')
}

async function waitForServer(server, origin, marker) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`${marker} server exited with code ${server.exitCode}`)

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
  throw new Error(`${marker} server did not start`)
}

async function fetchText(origin, path) {
  const response = await fetch(`${origin}${path}`)
  assert.equal(response.status, 200, `${path} returned ${response.status}`)
  return response.text()
}

function stripOgSignature(value) {
  return value.replace(OG_SIGNATURE_REGEX, '')
}

function extractSeoHead(html) {
  const head = stripOgSignature(html).match(HEAD_REGEX)?.[1]
  assert.ok(head, 'Rendered page is missing its head')
  return head
    .replace(STYLE_REGEX, '')
    .replace(SCRIPT_REGEX, '')
    .replace(LINK_REGEX, link => link.includes('rel="canonical"') || link.includes('rel="icon"') ? link : '')
    .replace(TAG_GAP_REGEX, '>\n<')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .join('\n')
}

function extractSchema(html) {
  const value = html.match(/<script type="application\/ld\+json"[^>]*>([^<]+)<\/script>/)?.[1]
  assert.ok(value, 'Rendered page is missing its schema.org graph')
  return JSON.parse(value)
}

function extractImageUrl(html) {
  const value = html.match(OG_IMAGE_REGEX)?.[1]
  assert.ok(value, 'Rendered page is missing its og:image meta tag')
  return value
}

function normalizeText(value) {
  return value.replace(/\r\n/g, '\n').trim()
}

function normalizeMarkdown(value) {
  return normalizeText(value).replace(/^last_updated: ".+"$/m, 'last_updated: "<timestamp>"')
}

async function captureRuntime(runtime) {
  await run('pnpm', ['run', 'typecheck'], runtime.dir)
  const buildOutput = await run('pnpm', ['exec', 'nuxt', 'build'], runtime.dir)
  assert.doesNotMatch(
    buildOutput,
    /\[UNRESOLVED_IMPORT\]|Could not resolve ['"](?:nitropack\/runtime|h3)['"]/,
    `${runtime.marker} build emitted an unresolved Nitro import warning`,
  )

  const nitroManifest = JSON.parse(await readFile(resolve(runtime.dir, '.output/nitro.json'), 'utf8'))
  assert.match(nitroManifest.versions.nitro, new RegExp(`^${runtime.nitroMajor}\\.`))
  if (runtime.nitroMajor === 3)
    assert.doesNotMatch(await readServerBundle(runtime.dir), /nitropack\/runtime/)

  const port = await getFreePort()
  const origin = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: runtime.dir,
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
    },
    stdio: 'inherit',
  })

  try {
    const compatResponse = await waitForServer(server, origin, runtime.marker)
    assert.deepEqual(await compatResponse.json(), { marker: runtime.marker })

    const internalFetchResponse = await fetch(`${origin}/api/internal-fetch`)
    assert.equal(internalFetchResponse.status, 200)
    const internalFetch = await internalFetchResponse.json()
    assert.equal(internalFetch.status, 200)
    assert.match(internalFetch.body, /Nuxt SEO compatibility/)

    const html = await fetchText(origin, '/')
    const robots = await fetchText(origin, '/robots.txt')
    const sitemap = await fetchText(origin, '/sitemap.xml')
    const llms = await fetchText(origin, '/llms.txt')
    const markdown = await fetchText(origin, '/index.md')

    const healthResponse = await fetch(`${origin}/__skew/health`)
    assert.equal(healthResponse.status, 200)
    const health = await healthResponse.json()
    assert.equal(health.ok, true)
    assert.equal(typeof health.version, 'string')

    const documentResponse = await fetch(origin, {
      headers: { 'sec-fetch-dest': 'document' },
    })
    assert.match(documentResponse.headers.get('set-cookie') ?? '', /__nkpv=/)

    const imageUrl = new URL(extractImageUrl(html))
    const imageResponse = await fetch(`${origin}${imageUrl.pathname}${imageUrl.search}`, {
      headers: { 'x-og-image-test': 'forwarded' },
    })
    assert.equal(imageResponse.status, 200)
    assert.equal(imageResponse.headers.get('content-type'), 'image/png')
    const image = Buffer.from(await imageResponse.arrayBuffer())
    assert.ok(image.byteLength > 1_000, 'Rendered OG image is unexpectedly small')
    assert.equal(image.subarray(1, 4).toString(), 'PNG')

    return {
      image: {
        bytes: image.byteLength,
        sha256: createHash('sha256').update(image).digest('hex'),
      },
      output: {
        head: extractSeoHead(html),
        internalHead: extractSeoHead(internalFetch.body),
        llms: normalizeText(llms),
        markdown: normalizeMarkdown(markdown),
        ogImageUrl: stripOgSignature(imageUrl.toString()),
        robots: normalizeText(robots),
        schema: extractSchema(html),
        sitemap: normalizeText(sitemap),
      },
    }
  }
  finally {
    if (server.exitCode === null) {
      const exited = once(server, 'exit')
      server.kill()
      await exited
    }
  }
}

async function main() {
  const [nitro2, nitro3] = await Promise.all(runtimes.map(captureRuntime))
  assert.deepEqual(nitro3.output, nitro2.output, 'Nitro 3 SEO output differs from Nitro 2')
  assert.deepEqual(nitro3.image, nitro2.image, 'Nitro 3 OG image snapshot differs from Nitro 2')
  console.log('Nitro 2 and Nitro 3 production output match.')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

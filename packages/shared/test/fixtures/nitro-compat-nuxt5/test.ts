import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'

const fixtureDir = import.meta.dirname

async function run(command: string, args: string[]) {
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

const buildOutput = await run('nuxt', ['build'])
assert.doesNotMatch(buildOutput, /Could not resolve ['"](?:nitropack\/runtime(?:\/[^'"]*)?|h3(?:\/[^'"]*)?)['"]/, 'Nuxt 5 build emitted a legacy Nitro import warning')

const portServer = createServer()
portServer.listen(0, '127.0.0.1')
await once(portServer, 'listening')
const address = portServer.address()
assert.ok(address && typeof address === 'object')
const port = address.port
portServer.close()
await once(portServer, 'close')

const origin = `http://127.0.0.1:${port}`
const nitroManifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))
assert.match(nitroManifest.versions.nitro, process.env.NUXT_TEST_LANE === 'nuxt5' ? /^3\./ : /^2\./)

const server = spawn(process.execPath, ['.output/server/index.mjs'], {
  cwd: import.meta.dirname,
  env: {
    ...process.env,
    HOST: '127.0.0.1',
    PORT: String(port),
  },
  stdio: 'inherit',
})

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error(`Nuxt 5 server exited with code ${server.exitCode}`)

    const response = await fetch(`${origin}/api/compat`, {
      headers: {
        'x-nuxtseo-test': 'nuxt-5-forwarded',
      },
      signal: AbortSignal.timeout(1_000),
    }).catch((error) => {
      // Timeouts and refused connections are expected until the child server is ready.
      if (error instanceof TypeError || (error instanceof Error && error.name) === 'TimeoutError')
        return null
      throw error
    })
    if (response?.ok)
      return response

    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Nuxt 5 server did not start')
}

try {
  const response = await waitForServer()
  const html = await fetch(origin).then(response => response.text())
  assert.match(html, /<p>App:nuxt-5<\/p>/)
  assert.match(html, /<p>nuxt-5<\/p>/)
  const aliases = await fetch(`${origin}/api/aliases`, { headers: { 'x-alias': 'typed-server' } })
  assert.equal(aliases.status, 200)
  assert.deepEqual(await aliases.json(), { message: 'Server:nuxt-5:typed-server', standalone: 'nuxt-5:typed-server' })
  const native = await fetch(`${origin}/api/portable`, { headers: { authorization: 'Bearer fixture', cookie: 'fixture=yes' } })
  assert.equal(native.status, 200)
  assert.deepEqual(await native.json(), { authorization: 'Bearer fixture', cookie: 'fixture=yes', routeHeader: 'native-rule' })
  const task = await fetch(`${origin}/api/task-fetch`)
  assert.equal(task.status, 200)
  assert.deepEqual(await task.json(), { header: 'restoration', marker: 'scheduled' })
  assert.deepEqual(await response.json(), {
    forwardedRequestHeader: 'nuxt-5-forwarded',
    marker: 'nuxt-5',
    requestContextMarker: 'nuxt-5-context',
  })
}
finally {
  server.kill()
  if (server.exitCode === null)
    await once(server, 'exit')
}

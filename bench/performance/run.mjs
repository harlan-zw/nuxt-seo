#!/usr/bin/env node
import { fork } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { summarizeProfiles } from './summarize.mjs'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const ALLOCATION_REPS = 9
const ALLOCATION_RUNS = 5
const PROFILE_BATCH_REQUESTS = 100
const PROFILE_DURATION_MS = 8_000
const TIMING_REPS = 16
const TIMING_RUNS = 100

function parseArguments(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index]
    const value = argv[index + 1]
    if (!key?.startsWith('--') || !value)
      throw new TypeError('Usage: run.mjs --server <entry> --output <json> [--profiles <directory>]')
    values.set(key.slice(2), value)
  }
  const server = values.get('server')
  const output = values.get('output')
  if (!server || !output)
    throw new TypeError('Both --server and --output are required.')
  return {
    output: resolve(output),
    profiles: values.has('profiles') ? resolve(values.get('profiles')) : undefined,
    server: resolve(server),
  }
}

function stats(samples) {
  const mean = samples.reduce((total, value) => total + value, 0) / samples.length
  const variance = samples.reduce((total, value) => total + (value - mean) ** 2, 0) / (samples.length - 1)
  const standardError = Math.sqrt(variance) / Math.sqrt(samples.length)
  return {
    value: mean,
    rme: mean === 0 ? 0 : standardError * 1.96 / mean * 100,
  }
}

async function findAvailablePort() {
  const server = createServer()
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolvePromise)
  })
  const address = server.address()
  await new Promise((resolvePromise, reject) => server.close(error => error ? reject(error) : resolvePromise()))
  if (!address || typeof address === 'string')
    throw new TypeError('Could not allocate a benchmark server port.')
  return address.port
}

function createIpcClient(child) {
  let nextId = 0
  return message => new Promise((resolvePromise, reject) => {
    const id = ++nextId
    const onExit = code => reject(new Error(`Benchmark server exited before IPC response ${id}, code ${code}.`))
    const onMessage = (response) => {
      if (response?.id !== id)
        return
      child.off('exit', onExit)
      child.off('message', onMessage)
      if (response.error)
        reject(new Error(response.error))
      else
        resolvePromise(response.result)
    }
    child.once('exit', onExit)
    child.on('message', onMessage)
    child.send({ id, ...message })
  })
}

async function waitForServer(origin, child, logs) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Benchmark server exited with code ${child.exitCode}.\n${logs.join('')}`)
    const response = await fetch(origin).catch(() => {
      // Connection failures are expected until the child starts listening.
      return undefined
    })
    if (response?.ok) {
      await response.arrayBuffer()
      return
    }
    await new Promise(resolvePromise => setTimeout(resolvePromise, 100))
  }
  throw new Error(`Benchmark server did not start.\n${logs.join('')}`)
}

async function render(origin, path = '/') {
  const response = await fetch(`${origin}${path}`)
  if (!response.ok)
    throw new Error(`SSR request ${path} returned ${response.status}.`)
  const body = await response.text()
  if (path === '/' && !body.includes('Nuxt SEO SSR Benchmark'))
    throw new Error('SSR response did not contain the benchmark marker.')
  return body.length
}

async function renderBatch(origin, paths, count) {
  let bytes = 0
  for (let index = 0; index < count; index++)
    bytes += await render(origin, paths[index % paths.length])
  return bytes
}

async function measure(origin, ipc, paths, options = {}) {
  const timingReps = options.timingReps || TIMING_REPS
  const timingRuns = options.timingRuns || TIMING_RUNS
  const allocationReps = options.allocationReps || ALLOCATION_REPS
  const allocationRuns = options.allocationRuns || ALLOCATION_RUNS
  for (let index = 0; index < 50; index++)
    await renderBatch(origin, paths, 1)

  const cpuSamples = []
  const wallSamples = []
  const allocationSamples = []
  for (let rep = 0; rep < timingReps; rep++) {
    const before = await ipc({ _tag: 'Metrics', collectGarbage: true })
    const startedAt = performance.now()
    await renderBatch(origin, paths, timingRuns)
    const wall = performance.now() - startedAt
    const after = await ipc({ _tag: 'Metrics', collectGarbage: false })
    const cpuMicros = after.cpu.user + after.cpu.system - before.cpu.user - before.cpu.system
    cpuSamples.push(cpuMicros / 1000 / timingRuns)
    wallSamples.push(wall / timingRuns)
  }
  for (let rep = 0; rep < allocationReps; rep++) {
    const before = await ipc({ _tag: 'Metrics', collectGarbage: true })
    await renderBatch(origin, paths, allocationRuns)
    const after = await ipc({ _tag: 'Metrics', collectGarbage: false })
    allocationSamples.push((after.memory.heapUsed - before.memory.heapUsed) / allocationRuns)
  }

  return {
    allocation: { value: Math.min(...allocationSamples) },
    cpu: stats(cpuSamples),
    wall: stats(wallSamples),
  }
}

function toBenches(id, name, result) {
  return [
    { id: `${id}-cpu`, name: `${name} CPU`, kind: 'time', ...result.cpu },
    { id: `${id}-wall`, name: `${name} wall`, kind: 'time', informational: true, ...result.wall },
    { id: `${id}-alloc`, name: `${name} allocated`, kind: 'memory', ...result.allocation },
  ]
}

async function stopChild(child) {
  if (child.exitCode !== null)
    return
  child.kill('SIGTERM')
  await new Promise(resolvePromise => child.once('exit', resolvePromise))
}

async function profileWorkload(origin, ipc, directory, workload) {
  const cpuPath = resolve(directory, `${workload.prefix}.cpuprofile`)
  const heapPath = resolve(directory, `${workload.prefix}.heapprofile`)
  await ipc({ _tag: 'StartProfiles' })
  const startedAt = performance.now()
  let requests = 0
  do {
    await renderBatch(origin, workload.paths, PROFILE_BATCH_REQUESTS)
    requests += PROFILE_BATCH_REQUESTS
  } while (performance.now() - startedAt < PROFILE_DURATION_MS)
  await ipc({ _tag: 'StopProfiles', cpuPath, heapPath })
  return summarizeProfiles(cpuPath, heapPath, { ...workload, requests })
}

async function main() {
  const args = parseArguments(process.argv.slice(2))
  const port = await findAvailablePort()
  const origin = `http://127.0.0.1:${port}`
  const logs = []
  const child = fork(args.server, [], {
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
      NITRO_PORT: String(port),
      PORT: String(port),
    },
    execArgv: [
      '--enable-source-maps',
      '--expose-gc',
      '--min-semi-space-size=256',
      '--max-semi-space-size=256',
      `--import=${resolve(currentDirectory, 'preload.mjs')}`,
    ],
    silent: true,
  })
  child.stdout.on('data', chunk => logs.push(chunk.toString()))
  child.stderr.on('data', chunk => logs.push(chunk.toString()))
  const ipc = createIpcClient(child)

  const result = await waitForServer(origin, child, logs)
    .then(async () => {
      const ssr = await measure(origin, ipc, ['/'])
      const robots = await measure(origin, ipc, ['/robots.txt'])
      const aiReady = await measure(origin, ipc, ['/llms.txt'])
      const benches = [
        ...toBenches('ssr', 'SSR page', ssr),
        ...toBenches('robots', 'robots.txt', robots),
        ...toBenches('ai-ready', 'llms.txt', aiReady),
      ]
      let profiles
      if (args.profiles) {
        await mkdir(args.profiles, { recursive: true })
        profiles = {
          aiReady: await profileWorkload(origin, ipc, args.profiles, {
            name: 'AI ready endpoint',
            paths: ['/llms.txt'],
            prefix: 'ai-ready',
          }),
          robots: await profileWorkload(origin, ipc, args.profiles, {
            name: 'Robots endpoint',
            paths: ['/robots.txt'],
            prefix: 'robots',
          }),
          ssr: await profileWorkload(origin, ipc, args.profiles, {
            name: 'SSR page',
            paths: ['/'],
            prefix: 'ssr',
          }),
          sitemap: await profileWorkload(origin, ipc, args.profiles, {
            name: 'Sitemap endpoint',
            paths: ['/sitemap.xml'],
            prefix: 'sitemap',
          }),
        }
      }
      return { benches, profiles, runtime: process.version, version: 2 }
    })
    .finally(() => stopChild(child))

  await mkdir(dirname(args.output), { recursive: true })
  await writeFile(args.output, `${JSON.stringify(result, null, 2)}\n`)
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`)
  process.exitCode = 1
})

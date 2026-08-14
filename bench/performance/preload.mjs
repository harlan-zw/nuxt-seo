import { writeFile } from 'node:fs/promises'
import inspector from 'node:inspector'
import process from 'node:process'

const session = new inspector.Session()
let profiling = false

function forceGarbageCollection() {
  if (typeof globalThis.gc !== 'function')
    throw new TypeError('The benchmark server requires --expose-gc.')
  globalThis.gc()
  globalThis.gc()
}

function post(method, params) {
  return new Promise((resolve, reject) => {
    session.post(method, params, (error, result) => {
      if (error)
        reject(error)
      else
        resolve(result)
    })
  })
}

function send(id, result) {
  process.send?.({ id, result })
}

function sendError(id, error) {
  process.send?.({
    id,
    error: error instanceof Error ? error.stack || error.message : String(error),
  })
}

async function handleMessage(message) {
  if (!message || typeof message !== 'object' || typeof message.id !== 'number')
    return

  if (message._tag === 'Metrics') {
    if (message.collectGarbage)
      forceGarbageCollection()
    send(message.id, {
      cpu: process.threadCpuUsage(),
      memory: process.memoryUsage(),
    })
    return
  }

  if (message._tag === 'StartProfiles') {
    if (profiling)
      throw new TypeError('Profiling already started.')
    session.connect()
    await post('Profiler.enable')
    await post('HeapProfiler.enable')
    await post('HeapProfiler.startSampling', {
      includeObjectsCollectedByMajorGC: true,
      includeObjectsCollectedByMinorGC: true,
      samplingInterval: 32 * 1024,
    })
    await post('Profiler.start')
    profiling = true
    send(message.id, { _tag: 'ProfilesStarted' })
    return
  }

  if (message._tag === 'StopProfiles') {
    if (!profiling)
      throw new TypeError('Profiling has not started.')
    const [{ profile: cpuProfile }, { profile: heapProfile }] = await Promise.all([
      post('Profiler.stop'),
      post('HeapProfiler.stopSampling'),
    ])
    await Promise.all([
      writeFile(message.cpuPath, JSON.stringify(cpuProfile)),
      writeFile(message.heapPath, JSON.stringify(heapProfile)),
    ])
    session.disconnect()
    profiling = false
    send(message.id, { _tag: 'ProfilesWritten' })
  }
}

process.on('message', (message) => {
  handleMessage(message).catch(error => sendError(message?.id, error))
})

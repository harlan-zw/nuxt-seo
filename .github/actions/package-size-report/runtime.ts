import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { discoverPackages } from './report.mjs'

interface Size { size: number, gzipSize: number }
interface Output { client: Size, server: Size }

function measureDirectory(directory: string, client: boolean, visited = new Set<string>()): Size {
  const total = { size: 0, gzipSize: 0 }
  const actualDirectory = realpathSync(directory)
  if (visited.has(actualDirectory))
    return total
  visited.add(actualDirectory)
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    const stats = statSync(path)
    if (stats.isDirectory()) {
      const nested = measureDirectory(path, client, visited)
      total.size += nested.size
      total.gzipSize += nested.gzipSize
    }
    else if (stats.isFile() && !entry.name.endsWith('.map')
      && (!client || /\.(?:[cm]?js|css)$/.test(entry.name))) {
      const actualPath = realpathSync(path)
      if (visited.has(actualPath))
        continue
      visited.add(actualPath)
      total.size += stats.size
      if (client)
        total.gzipSize += gzipSync(readFileSync(path), { level: 9 }).length
    }
  }
  return total
}

export function measureOutput(directory: string): Output {
  if (!existsSync(resolve(directory, 'server/index.mjs')))
    throw new Error(`Missing server build output: ${directory}`)
  if (!existsSync(resolve(directory, 'public')))
    throw new Error(`Missing client build output: ${directory}`)
  return {
    client: measureDirectory(resolve(directory, 'public'), true),
    server: measureDirectory(resolve(directory, 'server'), false),
  }
}

function buildFixture(directory: string, modulePath: string | null, cwd: string): Output {
  rmSync(directory, { recursive: true, force: true })
  mkdirSync(resolve(directory, 'app'), { recursive: true })
  writeFileSync(resolve(directory, 'app/app.vue'), '<template><main>Package size fixture</main></template>\n')
  writeFileSync(resolve(directory, 'nuxt.config.ts'), `export default {
    modules: ${JSON.stringify(modulePath ? [modulePath] : [])},
    workspaceDir: ${JSON.stringify(cwd)},
    devtools: { enabled: false },
    telemetry: false,
    buildId: 'package-size-fixture',
    compatibilityDate: '2026-10-01',
    site: { url: 'https://example.com' },
    skewProtection: { storage: { driver: 'fs-lite', base: ${JSON.stringify(resolve(directory, 'storage'))} } },
    sourcemap: { server: false, client: false },
    nitro: { preset: 'node-server', sourceMap: false },
  }\n`)
  // Workspace and user .nuxtrc files can enable the module in the control app.
  writeFileSync(resolve(directory, 'build.ts'), `import { buildNuxt, loadNuxt } from '@nuxt/kit'
const nuxt = await loadNuxt({ cwd: import.meta.dirname, dev: false, rcFile: false, globalRc: false })
try {
  await buildNuxt(nuxt)
}
finally {
  await nuxt.close()
}
`)
  const build = spawnSync(process.execPath, [resolve(directory, 'build.ts')], {
    cwd: directory,
    env: { ...process.env, NUXT_TELEMETRY_DISABLED: '1', NITRO_PRESET: 'node-server' },
    stdio: 'inherit',
    timeout: 300_000,
  })
  if (build.error)
    throw build.error
  if (build.status !== 0)
    throw new Error(`Runtime fixture build failed: ${directory}`)
  return measureOutput(resolve(directory, '.output'))
}

export function buildRuntimeSnapshot(root: string) {
  const destination = resolve(root, '.benchmark/runtime-size.json')
  rmSync(destination, { force: true })
  const metrics = []
  for (const pkg of discoverPackages(root)) {
    const modulePath = resolve(pkg.distPath, 'module.mjs')
    if (!existsSync(modulePath))
      continue
    const fixture = resolve(pkg.directory, '.benchmark/size-fixture')
    // Reuse the same path so generated absolute paths cannot inflate the delta.
    const control = buildFixture(fixture, null, pkg.directory)
    const enabled = buildFixture(fixture, modulePath, pkg.directory)
    for (const target of ['client', 'server'] as const) {
      metrics.push({
        id: `${pkg.relativeDirectory}:deployed:${target}`,
        kind: 'runtime',
        label: `${pkg.name} · ${target} (${target === 'client' ? 'gzip' : 'raw'})`,
        unit: target === 'client' ? 'gzip' : 'raw',
        size: enabled[target].size - control[target].size,
        gzipSize: enabled[target].gzipSize - control[target].gzipSize,
      })
    }
  }
  if (!metrics.length)
    throw new Error('No built Nuxt module found for runtime measurement')
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, JSON.stringify(metrics))
  return metrics
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  buildRuntimeSnapshot(resolve(process.argv[2] || '.'))

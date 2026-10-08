import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, relative, resolve, sep } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const IGNORED_DIRECTORIES = new Set([
  '.benchmark',
  '.claude',
  '.data',
  '.git',
  '.github',
  '.nuxt',
  '.output',
  'coverage',
  'examples',
  'fixtures',
  'node_modules',
  'playground',
  'test',
  'tests',
])
const PAYLOAD_EXTENSIONS = new Set(['.cjs', '.css', '.js', '.json', '.mjs', '.node', '.wasm'])
const GZIP_NOISE_BYTES = 16

function isPayloadFile(path) {
  return PAYLOAD_EXTENSIONS.has(extname(path)) && !path.endsWith('package.json')
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function cleanLabel(value) {
  return String(value).replace(/[|<>&`\r\n]/g, '_')
}

function cleanRange(value) {
  return String(value).replace(/[^\w@/+.:~^*<>=| -]/g, '_').replaceAll('|', '&#124;')
}

function formatSize(bytes) {
  if (bytes < 1000)
    return `${bytes} B`
  if (bytes < 1_000_000)
    return `${(bytes / 1000).toFixed(bytes < 10_000 ? 1 : 0)} kB`
  return `${(bytes / 1_000_000).toFixed(2)} MB`
}

function formatDelta(bytes) {
  if (bytes === 0)
    return '0 B'
  return `${bytes > 0 ? '+' : '-'}${formatSize(Math.abs(bytes))}`
}

function formatPercent(difference, base) {
  if (base <= 0)
    return ''
  const percent = difference / base * 100
  return ` (${percent > 0 ? '+' : ''}${percent.toFixed(1)}%)`
}

function walkDirectories(root, visit) {
  visit(root)
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || IGNORED_DIRECTORIES.has(entry.name))
      continue
    walkDirectories(resolve(root, entry.name), visit)
  }
}

function walkFiles(root) {
  if (!existsSync(root))
    return []
  const files = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = resolve(root, entry.name)
    if (entry.isDirectory() && !IGNORED_DIRECTORIES.has(entry.name))
      files.push(...walkFiles(path))
    else if (entry.isFile() && isPayloadFile(path))
      files.push(path)
  }
  return files.sort()
}

function values(value) {
  if (typeof value === 'string')
    return [value]
  if (Array.isArray(value))
    return value.flatMap(values)
  if (value && typeof value === 'object')
    return Object.values(value).flatMap(values)
  return []
}

function referencesDist(packageJson) {
  const filePatterns = Array.isArray(packageJson.files) ? packageJson.files : []
  if (filePatterns.some(pattern => pattern === 'dist' || pattern.startsWith('dist/')))
    return true
  return values({
    bin: packageJson.bin,
    browser: packageJson.browser,
    exports: packageJson.exports,
    main: packageJson.main,
    module: packageJson.module,
  }).some(path => typeof path === 'string' && /^\.?\/?dist\//.test(path))
}

export function discoverPackages(root) {
  const packages = []
  walkDirectories(root, (directory) => {
    const packagePath = resolve(directory, 'package.json')
    const distPath = resolve(directory, 'dist')
    if (!existsSync(packagePath) || !existsSync(distPath) || !referencesDist(readJson(packagePath)))
      return
    const packageJson = readJson(packagePath)
    if (packageJson.private)
      return
    packages.push({
      directory,
      distPath,
      name: cleanLabel(packageJson.name || relative(root, directory) || 'package'),
      packageJson,
      relativeDirectory: relative(root, directory).split(sep).join('/') || '.',
    })
  })
  return packages.sort((a, b) => a.relativeDirectory.localeCompare(b.relativeDirectory))
}

function measure(files) {
  return files.reduce((total, path) => {
    const contents = readFileSync(path)
    return {
      gzipSize: total.gzipSize + gzipSync(contents, { level: 9 }).length,
      size: total.size + contents.length,
    }
  }, { gzipSize: 0, size: 0 })
}

function addMetric(metrics, pkg, id, label, files) {
  const uniqueFiles = [...new Set(files)].filter(path => existsSync(path) && statSync(path).isFile())
  if (!uniqueFiles.length)
    return
  metrics.set(`${pkg.relativeDirectory}:${id}`, {
    ...measure(uniqueFiles),
    id: `${pkg.relativeDirectory}:${id}`,
    kind: 'output',
    label: `${pkg.name} · ${label}`,
  })
}

function exportEntries(packageJson) {
  const exports = packageJson.exports
  if (!exports)
    return []
  if (typeof exports === 'string' || Array.isArray(exports))
    return [['.', exports]]
  if (typeof exports !== 'object')
    return []
  const keys = Object.keys(exports)
  if (!keys.some(key => key.startsWith('.')))
    return [['.', exports]]
  return Object.entries(exports)
}

function firstPayloadTarget(target) {
  return values(target).find(path => typeof path === 'string'
    && !path.includes('*')
    && !/\.d\.[cm]?ts$/.test(path)
    && isPayloadFile(path))
}

function packageJsonHasExports(packageJson) {
  return packageJson.exports !== undefined
}

function collectPackageMetrics(pkg, metrics) {
  for (const [exportName, target] of exportEntries(pkg.packageJson)) {
    const path = firstPayloadTarget(target)
    if (path)
      addMetric(metrics, pkg, `export:${exportName}`, `export ${cleanLabel(exportName)}`, [resolve(pkg.directory, path)])
  }

  if (!packageJsonHasExports(pkg.packageJson)) {
    const main = firstPayloadTarget(pkg.packageJson.module) || firstPayloadTarget(pkg.packageJson.main)
    if (main)
      addMetric(metrics, pkg, 'entry', 'entry', [resolve(pkg.directory, main)])
  }

  const runtimeGroups = [
    ['runtime:app', 'app source files', resolve(pkg.distPath, 'runtime/app')],
    ['runtime:server', 'server source files', resolve(pkg.distPath, 'runtime/server')],
    ['runtime:shared', 'shared source files', resolve(pkg.distPath, 'runtime/shared')],
  ]
  for (const [id, label, path] of runtimeGroups)
    addMetric(metrics, pkg, id, label, walkFiles(path))

  addMetric(metrics, pkg, 'payload', 'built code files', walkFiles(pkg.distPath))
}

export function collectSnapshot(root) {
  const absoluteRoot = resolve(root)
  if (!existsSync(absoluteRoot))
    throw new Error(`Repository directory does not exist: ${absoluteRoot}`)
  const metrics = new Map()
  for (const pkg of discoverPackages(absoluteRoot)) {
    collectPackageMetrics(pkg, metrics)
    for (const [name, range] of Object.entries(pkg.packageJson.dependencies || {}).sort()) {
      metrics.set(`${pkg.relativeDirectory}:dependency:${name}`, {
        kind: 'dependency',
        label: `${pkg.name} · dependency ${cleanLabel(name)}`,
        range: cleanRange(range),
      })
    }
  }
  const runtimePath = resolve(absoluteRoot, '.benchmark/runtime-size.json')
  if (existsSync(runtimePath)) {
    for (const metric of readJson(runtimePath))
      metrics.set(metric.id, metric)
  }
  return metrics
}

function comparisonSize(metric) {
  return metric.unit === 'raw' ? metric.size : metric.gzipSize
}

function statusOf(base, head) {
  if ((head || base).kind === 'dependency')
    return 'same'
  if (!base)
    return 'new'
  if (!head)
    return 'removed'
  const difference = comparisonSize(head) - comparisonSize(base)
  if (Math.abs(difference) < GZIP_NOISE_BYTES)
    return 'same'
  return difference > 0 ? 'grew' : 'shrank'
}

function markerOf(status) {
  return {
    grew: '🔴',
    new: '🆕',
    removed: '🟢',
    same: '✅',
    shrank: '🟢',
  }[status]
}

function deltaCell(base, head, status) {
  if (status === 'new')
    return '🆕 new'
  if (status === 'removed')
    return '🟢 removed'
  if (status === 'same')
    return '—'
  const difference = comparisonSize(head) - comparisonSize(base)
  return `${markerOf(status)} ${formatDelta(difference)}${formatPercent(difference, comparisonSize(base))}`
}

export function renderReport(base, head, baseLabel = '') {
  const available = base !== null
  const baseline = base || new Map()
  const ids = [...new Set([...baseline.keys(), ...head.keys()])].sort()
  const rows = ids.map(id => ({
    base: baseline.get(id),
    head: head.get(id),
    label: head.get(id)?.label || baseline.get(id)?.label || id,
    status: available && ((head.get(id) || baseline.get(id)).kind !== 'runtime' || (baseline.has(id) && head.has(id)))
      ? statusOf(baseline.get(id), head.get(id))
      : 'unavailable',
  }))
  const runtime = rows.filter(row => (row.head || row.base).kind === 'runtime')
  const inventory = rows.filter(row => (row.head || row.base).kind === 'output')
  const dependencies = rows.filter(row => row.head?.kind === 'dependency')
  const output = [
    '<h3><img src="https://nuxt.com/assets/design-kit/icon-green.svg" alt="Nuxt logo" width="32" height="24"> Nuxt Module Size Analyzer</h3>',
    '',
  ]
  if (!available)
    output.push('⚠️ **Baseline unavailable. Size changes cannot be compared.**', '')
  if (!runtime.length) {
    output.push('Runtime impact was not measured. Package files do not show deployed runtime cost.')
  }
  else {
    output.push('Nuxt production fixture: module enabled minus the same app without the module.', '', '| Module output | Base added | PR added | Δ |', '|---|---:|---:|---:|')
    for (const row of runtime) {
      const before = row.base ? formatDelta(comparisonSize(row.base)) : 'unavailable'
      const after = row.head ? formatDelta(comparisonSize(row.head)) : 'unavailable'
      const delta = row.status === 'unavailable' ? 'unavailable' : deltaCell(row.base, row.head, row.status)
      output.push(`| ${row.label} | ${before} | ${after} | ${delta} |`)
    }
    output.push('', 'Client: all emitted JS/CSS, summed per-file gzip. Server: deployed files, raw bytes.', 'This fixture measures build output. It does not measure memory, latency, or every configuration.')
  }
  output.push('', `<details><summary>Package file inventory (${inventory.length})</summary>`, '', 'These rows overlap. They exclude dependencies, types, source maps, and non-code assets.', 'Entry rows measure one file. Source rows include unused files. Totals are not npm tarball sizes.', '', '| Package files | Summed gzip | Raw | Δ gzip |', '|---|---:|---:|---:|')
  for (const row of inventory) {
    const value = row.head || row.base
    const delta = row.status === 'unavailable' ? 'unavailable' : deltaCell(row.base, row.head, row.status)
    output.push(`| ${row.label} | ${formatSize(value.gzipSize)} | ${formatSize(value.size)} | ${delta} |`)
  }
  output.push('', '</details>')
  if (dependencies.length) {
    output.push('', `<details><summary>Declared dependencies (${dependencies.length})</summary>`, '', 'Dependency declarations do not show which code reaches the client or server.', '', '| Package | Dependency | Requested |', '|---|---|---|')
    for (const row of dependencies)
      output.push(`| ${row.head.label.replace(' · dependency ', ' | ')} | ${row.head.range} |`)
    output.push('', '</details>')
  }
  if (baseLabel)
    output.push('', `<sub>Baseline: ${cleanLabel(baseLabel)} · changes below ${GZIP_NOISE_BYTES} B are ignored</sub>`)
  return `${output.join('\n')}\n`
}

function run() {
  const baseDirectory = process.env.PACKAGE_SIZE_BASE_DIRECTORY
  const headDirectory = process.env.PACKAGE_SIZE_HEAD_DIRECTORY
  const reportPath = process.env.PACKAGE_SIZE_REPORT_PATH
  if (!baseDirectory || !headDirectory || !reportPath)
    throw new Error('PACKAGE_SIZE_BASE_DIRECTORY, PACKAGE_SIZE_HEAD_DIRECTORY, and PACKAGE_SIZE_REPORT_PATH are required')

  const base = process.env.PACKAGE_SIZE_BASE_AVAILABLE === 'false'
    ? null
    : collectSnapshot(baseDirectory)
  const head = collectSnapshot(headDirectory)
  if (!head.size)
    throw new Error('No published dist output found in the pull request build')

  const report = renderReport(base, head, process.env.PACKAGE_SIZE_BASE_LABEL)
  mkdirSync(dirname(resolve(reportPath)), { recursive: true })
  // Keep the artifact format signature separate from its visible heading.
  writeFileSync(resolve(reportPath), `### 📦 Package Size\n\n${report}`, 'utf8')
  process.stdout.write(report)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  run()

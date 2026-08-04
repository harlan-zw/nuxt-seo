import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
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
  return String(value).replace(/[^\w@/+.:-]/g, '_')
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

function discoverPackages(root) {
  const packages = []
  walkDirectories(root, (directory) => {
    const packagePath = resolve(directory, 'package.json')
    const distPath = resolve(directory, 'dist')
    if (!existsSync(packagePath) || !existsSync(distPath) || !referencesDist(readJson(packagePath)))
      return
    const packageJson = readJson(packagePath)
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

function parseVersion(value) {
  const match = String(value).trim().replace(/^v/, '').match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9a-z.-]+))?/i)
  if (!match)
    return null
  return {
    major: Number(match[1]),
    minor: Number(match[2] || 0),
    patch: Number(match[3] || 0),
    prerelease: match[4] || '',
  }
}

function compareVersions(left, right) {
  for (const key of ['major', 'minor', 'patch']) {
    if (left[key] !== right[key])
      return left[key] > right[key] ? 1 : -1
  }
  if (left.prerelease === right.prerelease)
    return 0
  if (!left.prerelease)
    return 1
  if (!right.prerelease)
    return -1
  return left.prerelease.localeCompare(right.prerelease)
}

function testComparator(version, comparator) {
  const match = comparator.match(/^(<=|>=|[<>=]|[~^]\s*)?v?(\d+|[x*])(?:\.(\d+|[x*]))?(?:\.(\d+|[x*]))?(?:-([0-9a-z.-]+))?$/i)
  if (!match)
    return false
  const operator = (match[1] || '').trim()
  const parts = [match[2], match[3], match[4]]
  if (parts[0] === '*' || parts[0]?.toLowerCase() === 'x')
    return true

  const targetValue = `${parts.map(part => part && !['x', 'X', '*'].includes(part) ? part : '0').join('.')}${match[5] ? `-${match[5]}` : ''}`
  const target = parseVersion(targetValue)
  if (!target)
    return false
  const compared = compareVersions(version, target)
  if (operator === '>=')
    return compared >= 0
  if (operator === '>')
    return compared > 0
  if (operator === '<=')
    return compared <= 0
  if (operator === '<')
    return compared < 0

  const hasWildcard = parts.some(part => !part || ['x', 'X', '*'].includes(part))
  if (hasWildcard)
    return version.major === target.major && (!parts[1] || ['x', 'X', '*'].includes(parts[1]) || version.minor === target.minor)
  if (operator === '^') {
    const upper = target.major > 0
      ? { ...target, major: target.major + 1, minor: 0, patch: 0, prerelease: '' }
      : target.minor > 0
        ? { ...target, minor: target.minor + 1, patch: 0, prerelease: '' }
        : { ...target, patch: target.patch + 1, prerelease: '' }
    return compared >= 0 && compareVersions(version, upper) < 0
  }
  if (operator === '~') {
    const upper = { ...target, minor: target.minor + 1, patch: 0, prerelease: '' }
    return compared >= 0 && compareVersions(version, upper) < 0
  }
  return compared === 0
}

export function satisfiesVersion(versionValue, rangeValue) {
  const version = parseVersion(versionValue)
  const range = String(rangeValue || '').trim()
  if (!version || !range || /^(?:catalog|workspace|file|link|npm):/.test(range))
    return false
  if (range === '*' || range === 'latest')
    return true
  return range.split('||').some((alternative) => {
    const hyphen = alternative.trim().match(/^(\S+)\s+-\s+(\S+)$/)
    if (hyphen)
      return testComparator(version, `>=${hyphen[1]}`) && testComparator(version, `<=${hyphen[2]}`)
    const comparators = alternative.trim().split(/\s+/).filter(Boolean)
    return comparators.length > 0 && comparators.every(comparator => testComparator(version, comparator))
  })
}

function readCatalog(root) {
  const workspacePath = resolve(root, 'pnpm-workspace.yaml')
  if (!existsSync(workspacePath))
    return new Map()
  const catalog = new Map()
  let inCatalog = false
  for (const line of readFileSync(workspacePath, 'utf8').split(/\r?\n/)) {
    if (line === 'catalog:') {
      inCatalog = true
      continue
    }
    if (inCatalog && line && !/^\s/.test(line))
      break
    if (!inCatalog)
      continue
    if (!line.startsWith('  '))
      continue
    const entry = line.slice(2)
    const separatorIndex = entry.indexOf(': ')
    if (separatorIndex === -1)
      continue
    const rawName = entry.slice(0, separatorIndex)
    const rawRange = entry.slice(separatorIndex + 2)
    const name = rawName[0] === rawName.at(-1) && ['\'', '"'].includes(rawName[0])
      ? rawName.slice(1, -1)
      : rawName
    const range = rawRange[0] === rawRange.at(-1) && ['\'', '"'].includes(rawRange[0])
      ? rawRange.slice(1, -1)
      : rawRange
    catalog.set(name, range)
  }
  return catalog
}

function dependencyRange(name, range, catalog) {
  if (range === 'catalog:')
    return catalog.get(name) || range
  return range
}

function packagePayloadFiles(directory, packageJson) {
  const paths = []
  const filePatterns = Array.isArray(packageJson.files) ? packageJson.files : []
  for (const pattern of filePatterns) {
    if (typeof pattern !== 'string' || pattern.includes('*'))
      continue
    const path = resolve(directory, pattern)
    if (!existsSync(path))
      continue
    paths.push(...(statSync(path).isDirectory() ? walkFiles(path) : isPayloadFile(path) ? [path] : []))
  }
  if (paths.length)
    return [...new Set(paths)]

  const distPath = resolve(directory, 'dist')
  if (existsSync(distPath))
    return walkFiles(distPath)
  return values({ exports: packageJson.exports, main: packageJson.main, module: packageJson.module })
    .filter(path => typeof path === 'string' && !path.includes('*'))
    .map(path => resolve(directory, path))
    .filter(path => existsSync(path) && statSync(path).isFile() && isPayloadFile(path))
}

function dependencyPackage(pkg, name) {
  const packagePath = resolve(pkg.directory, 'node_modules', name, 'package.json')
  if (!existsSync(packagePath))
    return null
  const realPackagePath = realpathSync(packagePath)
  return {
    directory: dirname(realPackagePath),
    packageJson: readJson(realPackagePath),
  }
}

function nuxtProvider(pkg) {
  const packagePath = resolve(pkg.directory, 'node_modules/nuxt/package.json')
  if (!existsSync(packagePath))
    return null
  const realPackagePath = realpathSync(packagePath)
  const packageJson = readJson(realPackagePath)
  return {
    dependenciesDirectory: dirname(dirname(realPackagePath)),
    packageJson,
  }
}

function nuxtDependencyVersion(provider, name) {
  if (!provider?.packageJson.dependencies?.[name])
    return null
  const packagePath = resolve(provider.dependenciesDirectory, name, 'package.json')
  return existsSync(packagePath) ? readJson(realpathSync(packagePath)).version : null
}

function collectDependencies(pkg, metrics, catalog) {
  const provider = nuxtProvider(pkg)
  for (const [name, declaredRange] of Object.entries(pkg.packageJson.dependencies || {}).sort()) {
    const range = dependencyRange(name, declaredRange, catalog)
    const dependency = dependencyPackage(pkg, name)
    const providedVersion = nuxtDependencyVersion(provider, name)
    const free = Boolean(providedVersion && satisfiesVersion(providedVersion, range))
    const measured = free || !dependency
      ? { gzipSize: 0, size: 0 }
      : measure(packagePayloadFiles(dependency.directory, dependency.packageJson))
    metrics.set(`${pkg.relativeDirectory}:dependency:${name}`, {
      ...measured,
      free,
      id: `${pkg.relativeDirectory}:dependency:${name}`,
      kind: 'dependency',
      label: `${pkg.name} · dependency ${cleanLabel(name)}`,
      nuxtVersion: provider?.packageJson.version || '',
      providedVersion: providedVersion || '',
      range: cleanRange(range),
      resolvedVersion: dependency?.packageJson.version || '',
    })
  }
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
    ['runtime:app', 'app runtime', resolve(pkg.distPath, 'runtime/app')],
    ['runtime:server', 'server runtime', resolve(pkg.distPath, 'runtime/server')],
    ['runtime:shared', 'shared runtime', resolve(pkg.distPath, 'runtime/shared')],
  ]
  for (const [id, label, path] of runtimeGroups)
    addMetric(metrics, pkg, id, label, walkFiles(path))

  addMetric(metrics, pkg, 'payload', 'published payload', walkFiles(pkg.distPath))
}

export function collectSnapshot(root) {
  const absoluteRoot = resolve(root)
  if (!existsSync(absoluteRoot))
    throw new Error(`Repository directory does not exist: ${absoluteRoot}`)
  const metrics = new Map()
  const catalog = readCatalog(absoluteRoot)
  for (const pkg of discoverPackages(absoluteRoot)) {
    collectPackageMetrics(pkg, metrics)
    collectDependencies(pkg, metrics, catalog)
  }
  return metrics
}

function statusOf(base, head) {
  if (!base && head?.kind === 'dependency' && head.free)
    return 'same'
  if (!base)
    return 'new'
  if (!head && base.kind === 'dependency' && base.free)
    return 'same'
  if (!head)
    return 'removed'
  const difference = head.gzipSize - base.gzipSize
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
  const difference = head.gzipSize - base.gzipSize
  return `${markerOf(status)} ${formatDelta(difference)}${formatPercent(difference, base.gzipSize)}`
}

export function renderReport(base, head, baseLabel = '') {
  const ids = [...new Set([...base.keys(), ...head.keys()])].sort()
  const rows = ids.map(id => ({
    base: base.get(id),
    head: head.get(id),
    id,
    label: head.get(id)?.label || base.get(id)?.label || id,
    status: statusOf(base.get(id), head.get(id)),
  }))
  const sizeRows = rows.filter(row => row.head?.kind !== 'dependency' || !row.head.free || (row.base && !row.base.free))
  const changed = sizeRows.filter(row => row.status !== 'same')
  const grew = changed.filter(row => row.status === 'grew')
  const smaller = changed.filter(row => row.status === 'shrank' || row.status === 'removed')
  const added = changed.filter(row => row.status === 'new')

  const verdict = []
  if (grew.length)
    verdict.push(`⚠️ **${grew.length} size metric${grew.length === 1 ? '' : 's'} grew**`)
  else if (smaller.length)
    verdict.push(`🟢 **${smaller.length} size metric${smaller.length === 1 ? '' : 's'} smaller**`)
  else
    verdict.push('✅ **No notable size changes**')
  if (added.length)
    verdict.push(`🆕 ${added.length} new metric${added.length === 1 ? '' : 's'} tracked`)

  const output = ['### 📦 Package Size', '', verdict.join(' · ')]
  if (changed.length) {
    output.push('', '| Package output | Gzipped | Δ |', '|---|---:|---:|')
    for (const row of changed) {
      const before = row.base ? formatSize(row.base.gzipSize) : '—'
      const after = row.head ? formatSize(row.head.gzipSize) : '—'
      output.push(`| **${row.label}** | ${before} → ${after} | ${deltaCell(row.base, row.head, row.status)} |`)
    }
  }

  output.push(
    '',
    `<details><summary>All tracked output (${sizeRows.length})</summary>`,
    '',
    '| Package output | Gzipped | Raw | |',
    '|---|---:|---:|---:|',
  )
  for (const row of sizeRows) {
    const value = row.head || row.base
    output.push(`| ${row.label} | ${formatSize(value.gzipSize)} | ${formatSize(value.size)} | ${markerOf(row.status)} |`)
  }
  output.push('', '</details>')

  const dependencies = rows.filter(row => row.head?.kind === 'dependency')
  if (dependencies.length) {
    output.push(
      '',
      `<details><summary>Runtime dependencies (${dependencies.length})</summary>`,
      '',
      '| Package | Dependency | Requested | Resolved | Cost |',
      '|---|---|---:|---:|---|',
    )
    for (const row of dependencies) {
      const dependency = row.head
      const name = dependency.label.replace(' · dependency ', ' | ')
      const cost = dependency.free
        ? `♻️ free via Nuxt ${cleanLabel(dependency.nuxtVersion)}`
        : dependency.providedVersion
          ? `📦 ${formatSize(dependency.gzipSize)} gzip, Nuxt has ${cleanLabel(dependency.providedVersion)}`
          : `📦 ${formatSize(dependency.gzipSize)} gzip`
      output.push(`| ${name} | ${dependency.range} | ${cleanLabel(dependency.resolvedVersion || 'unresolved')} | ${cost} |`)
    }
    output.push('', '</details>')
  }

  if (baseLabel)
    output.push('', `<sub>Baseline: ${cleanLabel(baseLabel)} · gzip is the comparison metric · changes below ${GZIP_NOISE_BYTES} B gzip are ignored</sub>`)
  return `${output.join('\n')}\n`
}

function run() {
  const baseDirectory = process.env.PACKAGE_SIZE_BASE_DIRECTORY
  const headDirectory = process.env.PACKAGE_SIZE_HEAD_DIRECTORY
  const reportPath = process.env.PACKAGE_SIZE_REPORT_PATH
  if (!baseDirectory || !headDirectory || !reportPath)
    throw new Error('PACKAGE_SIZE_BASE_DIRECTORY, PACKAGE_SIZE_HEAD_DIRECTORY, and PACKAGE_SIZE_REPORT_PATH are required')

  const base = process.env.PACKAGE_SIZE_BASE_AVAILABLE === 'false'
    ? new Map()
    : collectSnapshot(baseDirectory)
  const head = collectSnapshot(headDirectory)
  if (!head.size)
    throw new Error('No published dist output found in the pull request build')

  const report = renderReport(base, head, process.env.PACKAGE_SIZE_BASE_LABEL)
  mkdirSync(dirname(resolve(reportPath)), { recursive: true })
  writeFileSync(resolve(reportPath), report, 'utf8')
  process.stdout.write(report)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]))
  run()

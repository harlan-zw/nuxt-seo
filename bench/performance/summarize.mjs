import { existsSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping'
import { renderProfileAnalysis } from './profile-report.mjs'

const SEO_MODULES = new Set([
  '@nuxtjs/robots',
  '@nuxtjs/seo',
  '@nuxtjs/sitemap',
  'nuxt-ai-ready',
  'nuxt-link-checker',
  'nuxt-og-image',
  'nuxt-schema-org',
  'nuxt-seo-utils',
  'nuxt-site-config',
  'nuxt-skew-protection',
  'nuxtseo-shared',
  'unhead',
])

const MODULE_MATCHERS = [
  ['unhead', /(?:^|\/)(?:@unhead\/[^/]+|unhead)\//],
  ['@nuxtjs/seo', /(?:^|\/)packages\/nuxt-seo\/src\//],
  ['@nuxtjs/robots', /(?:^|\/)@nuxtjs\/robots\//],
  ['@nuxtjs/sitemap', /(?:^|\/)@nuxtjs\/sitemap\//],
  ['nuxt-ai-ready', /(?:^|\/)nuxt-ai-ready\//],
  ['nuxt-link-checker', /(?:^|\/)nuxt-link-checker\//],
  ['nuxt-og-image', /(?:^|\/)nuxt-og-image\//],
  ['nuxt-schema-org', /(?:^|\/)nuxt-schema-org\//],
  ['nuxt-seo-utils', /(?:^|\/)nuxt-seo-utils\//],
  ['nuxt-site-config', /(?:^|\/)(?:nuxt-site-config(?:-kit)?|site-config-stack)\//],
  ['nuxt-skew-protection', /(?:^|\/)nuxt-skew-protection\//],
  ['nuxtseo-shared', /(?:^|\/)nuxtseo-shared\//],
  ['@nuxtjs/i18n', /(?:^|\/)@nuxtjs\/i18n\//],
  ['vue', /(?:^|\/)(?:@vue\/[^/]+|vue)\//],
  ['nuxt', /(?:^|\/)nuxt\/dist\//],
  ['nitro', /(?:^|\/)(?:nitropack|h3)\//],
]

function compactSource(source) {
  const normalized = source.replaceAll('\\', '/')
  const nodeModules = normalized.lastIndexOf('/node_modules/')
  if (nodeModules !== -1)
    return normalized.slice(nodeModules + '/node_modules/'.length)
  const packages = normalized.lastIndexOf('/packages/')
  if (packages !== -1)
    return normalized.slice(packages + 1)
  return normalized.replace(/^file:\/\//, '')
}

function classifyModule(source) {
  if (source === '(native)' || source.startsWith('node:'))
    return 'node'
  if (source.includes('/fixture') || source.includes('/fixtures/'))
    return 'fixture'
  for (const [name, pattern] of MODULE_MATCHERS) {
    if (pattern.test(source))
      return name
  }
  if (source.includes('/chunks/nitro/'))
    return 'nitro-bundled'
  if (source.includes('/chunks/virtual/') || source.includes('/chunks/routes/'))
    return 'nuxt-bundled'
  const clean = compactSource(source)
  if (clean.startsWith('@'))
    return clean.split('/').slice(0, 2).join('/')
  return clean.includes('/') ? clean.split('/')[0] : clean
}

function sourceMapPath(url) {
  if (!url?.startsWith('file:'))
    return undefined
  const generatedPath = fileURLToPath(url)
  const mapPath = `${generatedPath}.map`
  return existsSync(mapPath) ? mapPath : undefined
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findDefinition(contents, name) {
  const escaped = escapeRegExp(name)
  const patterns = [
    new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:async\\s+)?function\\s+${escaped}\\b`),
    new RegExp(`(?:^|\\n)\\s*(?:export\\s+)?(?:const|let|var)\\s+${escaped}\\s*=`),
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(contents)
    if (match) {
      const definitionIndex = match.index + (contents[match.index] === '\n' ? 1 : 0)
      return contents.slice(0, definitionIndex).split('\n').length
    }
  }
  return undefined
}

function createRegionLookup(contents) {
  const regions = []
  const stack = []
  const lines = contents.split('\n')
  for (let index = 0; index < lines.length; index++) {
    const source = /^\/\/#region[ \t]+(\S.*)$/.exec(lines[index])?.[1]
    if (source) {
      const region = { end: lines.length, source, start: index + 2 }
      stack.push(region)
    }
    else if (lines[index].startsWith('//#endregion')) {
      const region = stack.pop()
      if (region) {
        region.end = index
        regions.push(region)
      }
    }
  }
  return line => regions
    .filter(region => region.start <= line && region.end >= line)
    .at(-1)
}

export function createFrameResolver() {
  const sourceMaps = new Map()
  const sourceContents = new Map()

  function readSource(path) {
    if (!sourceContents.has(path))
      sourceContents.set(path, existsSync(path) ? readFileSync(path, 'utf8') : undefined)
    return sourceContents.get(path)
  }

  function loadSourceMap(mapPath) {
    let info = sourceMaps.get(mapPath)
    if (info)
      return info
    const payload = JSON.parse(readFileSync(mapPath, 'utf8'))
    const mapDirectory = dirname(mapPath)
    const generatedContents = readSource(mapPath.slice(0, -4))
    info = {
      attributions: new Map(),
      findRegion: generatedContents ? createRegionLookup(generatedContents) : undefined,
      sourcePaths: payload.sources.map(source => ({
        path: resolve(mapDirectory, source),
        source,
      })),
      traceMap: payload.mappings ? new TraceMap(payload, mapDirectory) : undefined,
    }
    sourceMaps.set(mapPath, info)
    return info
  }

  function attributeNamedFunction(info, name) {
    if (!name || name.startsWith('(') || !/^[\w$]+$/.test(name))
      return undefined
    if (info.attributions.has(name))
      return info.attributions.get(name)
    const matches = new Map()
    for (const candidate of info.sourcePaths) {
      const contents = readSource(candidate.path)
      if (!contents)
        continue
      const line = findDefinition(contents, name)
      if (line !== undefined)
        matches.set(`${compactSource(candidate.source)}:${line}`, { line, source: candidate.source })
    }
    const attribution = matches.size === 1 ? [...matches.values()][0] : undefined
    info.attributions.set(name, attribution)
    return attribution
  }

  return (frame) => {
    let attribution = 'direct'
    let name = frame.functionName || '(anonymous)'
    let source = frame.url || '(native)'
    let line = Math.max(0, Number(frame.lineNumber) || 0) + 1
    let column = Math.max(0, Number(frame.columnNumber) || 0)
    const mapPath = sourceMapPath(frame.url)
    if (mapPath) {
      const info = loadSourceMap(mapPath)
      const original = info.traceMap ? originalPositionFor(info.traceMap, { line, column }) : undefined
      if (original?.source) {
        attribution = 'source-map'
        source = original.source
        line = original.line || line
        column = original.column || column
        name = original.name || name
      }
      else {
        const functionAttribution = attributeNamedFunction(info, name)
        if (functionAttribution) {
          source = functionAttribution.source
          line = functionAttribution.line
          column = 0
          attribution = 'function'
        }
        else {
          const region = info.findRegion?.(line)
          if (region) {
            source = region.source
            line = Math.max(1, line - region.start + 1)
            column = 0
            attribution = 'region'
          }
          else {
            attribution = 'generated'
          }
        }
      }
    }
    const compact = compactSource(source)
    const module = classifyModule(compact)
    return {
      attribution,
      group: SEO_MODULES.has(module) ? 'seo' : 'generic',
      module,
      name,
      source: compact,
      line,
      column,
    }
  }
}

function frameKey(frame) {
  return `${frame.name}\0${frame.source}\0${frame.line}`
}

function keepGlobalAndSeo(rows, count = 100) {
  const selected = new Set([
    ...rows.slice(0, count),
    ...rows.filter(row => row.group === 'seo').slice(0, count),
  ])
  return [...selected].sort((left, right) => (right.value ?? right.inclusive) - (left.value ?? left.inclusive))
}

function aggregateFrames(values, frames, total) {
  const rows = new Map()
  for (const [id, value] of values) {
    if (value <= 0)
      continue
    const frame = frames.get(id)
    if (['(root)', '(program)', '(idle)'].includes(frame.name))
      continue
    const key = frameKey(frame)
    const current = rows.get(key)
    if (current)
      current.value += value
    else
      rows.set(key, { ...frame, value })
  }
  const sorted = [...rows.values()]
    .map(row => ({ ...row, percent: total > 0 ? row.value / total * 100 : 0 }))
    .sort((left, right) => right.value - left.value)
  return keepGlobalAndSeo(sorted)
}

function aggregateAttribution(values, frames, total) {
  const kinds = new Map()
  for (const [id, value] of values) {
    const attribution = frames.get(id).attribution || 'custom'
    kinds.set(attribution, (kinds.get(attribution) || 0) + value)
  }
  return [...kinds]
    .map(([name, value]) => ({ name, percent: total > 0 ? value / total * 100 : 0, value }))
    .sort((left, right) => right.value - left.value)
}

function aggregateModules(self, frames, parents, total) {
  const modules = new Map()
  function moduleRow(frame) {
    let row = modules.get(frame.module)
    if (!row) {
      row = { group: frame.group, inclusive: 0, name: frame.module, self: 0 }
      modules.set(frame.module, row)
    }
    return row
  }
  for (const [id, value] of self) {
    if (value <= 0)
      continue
    const frame = frames.get(id)
    moduleRow(frame).self += value
    const seen = new Set()
    let current = id
    while (current !== undefined) {
      const ancestor = frames.get(current)
      if (ancestor && !seen.has(ancestor.module) && !['(root)', '(program)', '(idle)'].includes(ancestor.name)) {
        moduleRow(ancestor).inclusive += value
        seen.add(ancestor.module)
      }
      current = parents.get(current)
    }
  }
  return [...modules.values()]
    .map(row => ({
      ...row,
      inclusivePercent: total > 0 ? row.inclusive / total * 100 : 0,
      selfPercent: total > 0 ? row.self / total * 100 : 0,
    }))
    .sort((left, right) => right.inclusive - left.inclusive)
}

function buildPaths(inclusive, self, frames, parents, total) {
  const sorted = [...inclusive]
    .filter(([, value]) => value > 0)
    .map(([id, value]) => {
      const path = []
      let current = id
      while (current !== undefined) {
        const frame = frames.get(current)
        if (frame && !['(root)', '(program)', '(idle)'].includes(frame.name))
          path.push(frame)
        current = parents.get(current)
      }
      return {
        ...frames.get(id),
        inclusive: value,
        percent: total > 0 ? value / total * 100 : 0,
        self: self.get(id) || 0,
        path: path.reverse(),
      }
    })
    .filter(row => !['(root)', '(program)', '(idle)'].includes(row.name))
    .sort((left, right) => right.inclusive - left.inclusive)
  return keepGlobalAndSeo(sorted)
}

function isExcludedCpuLeaf(frame) {
  return ['(root)', '(program)', '(idle)'].includes(frame.name)
    || (frame.source === 'node:inspector' && frame.name === 'post')
}

export function summarizeCpuProfile(profile, resolveFrame = createFrameResolver()) {
  const nodes = new Map(profile.nodes.map(node => [node.id, node]))
  const parents = new Map()
  for (const node of profile.nodes) {
    for (const child of node.children || [])
      parents.set(child, node.id)
  }
  const frames = new Map([...nodes].map(([id, node]) => [id, resolveFrame(node.callFrame)]))
  const self = new Map()
  const inclusive = new Map()
  let sampled = 0
  let total = 0
  for (let index = 0; index < (profile.samples?.length || 0); index++) {
    const id = profile.samples[index]
    const value = profile.timeDeltas?.[index] || 0
    sampled += value
    if (value <= 0 || !nodes.has(id) || isExcludedCpuLeaf(frames.get(id)))
      continue
    total += value
    self.set(id, (self.get(id) || 0) + value)
    const seen = new Set()
    let current = id
    while (current !== undefined) {
      const key = frameKey(frames.get(current))
      if (!seen.has(key)) {
        inclusive.set(current, (inclusive.get(current) || 0) + value)
        seen.add(key)
      }
      current = parents.get(current)
    }
  }
  return {
    attribution: aggregateAttribution(self, frames, total),
    unit: 'microseconds',
    sampled,
    excluded: sampled - total,
    total,
    self: aggregateFrames(self, frames, total),
    inclusive: aggregateFrames(inclusive, frames, total),
    modules: aggregateModules(self, frames, parents, total),
    paths: buildPaths(inclusive, self, frames, parents, total),
  }
}

export function summarizeHeapProfile(profile, resolveFrame = createFrameResolver()) {
  const nodes = new Map()
  const parents = new Map()
  const self = new Map()
  let nextId = 0
  function visit(node, parent) {
    const id = nextId++
    nodes.set(id, node)
    if (parent !== undefined)
      parents.set(id, parent)
    self.set(id, node.selfSize || 0)
    for (const child of node.children || [])
      visit(child, id)
  }
  visit(profile.head)
  const frames = new Map([...nodes].map(([id, node]) => [id, resolveFrame(node.callFrame)]))
  const inclusive = new Map()
  let total = 0
  for (const [id, value] of self) {
    total += value
    const seen = new Set()
    let current = id
    while (current !== undefined) {
      const key = frameKey(frames.get(current))
      if (!seen.has(key)) {
        inclusive.set(current, (inclusive.get(current) || 0) + value)
        seen.add(key)
      }
      current = parents.get(current)
    }
  }
  return {
    attribution: aggregateAttribution(self, frames, total),
    unit: 'bytes',
    sampled: total,
    excluded: 0,
    total,
    self: aggregateFrames(self, frames, total),
    inclusive: aggregateFrames(inclusive, frames, total),
    modules: aggregateModules(self, frames, parents, total),
    paths: buildPaths(inclusive, self, frames, parents, total),
  }
}

function createSpeedscope(cpuProfile, heapProfile, resolveFrame, name) {
  const frames = []
  const frameIndexes = new Map()
  function frameIndex(callFrame) {
    const frame = resolveFrame(callFrame)
    const key = `${frame.name}\0${frame.source}\0${frame.line}\0${frame.column}`
    let index = frameIndexes.get(key)
    if (index === undefined) {
      index = frames.length
      frameIndexes.set(key, index)
      frames.push({ name: frame.name, file: frame.source, line: frame.line, col: frame.column })
    }
    return index
  }

  const cpuNodes = new Map(cpuProfile.nodes.map(node => [node.id, node]))
  const cpuParents = new Map()
  for (const node of cpuProfile.nodes) {
    for (const child of node.children || [])
      cpuParents.set(child, node.id)
  }
  function cpuStack(id) {
    const stack = []
    let current = id
    while (current !== undefined) {
      const node = cpuNodes.get(current)
      if (!node)
        break
      stack.push(frameIndex(node.callFrame))
      current = cpuParents.get(current)
    }
    return stack.reverse()
  }
  const cpuWeights = cpuProfile.timeDeltas || []
  const cpuSamples = (cpuProfile.samples || []).map(cpuStack)

  const heapSamples = []
  const heapWeights = []
  function visitHeap(node, parentStack) {
    const stack = [...parentStack, frameIndex(node.callFrame)]
    if (node.selfSize > 0) {
      heapSamples.push(stack)
      heapWeights.push(node.selfSize)
    }
    for (const child of node.children || [])
      visitHeap(child, stack)
  }
  visitHeap(heapProfile.head, [])

  return {
    $schema: 'https://www.speedscope.app/file-format-schema.json',
    activeProfileIndex: 0,
    exporter: 'nuxt-seo SSR benchmark',
    name: `Nuxt SEO ${name} profiles`,
    profiles: [
      {
        type: 'sampled',
        name: 'SSR CPU',
        unit: 'microseconds',
        startValue: 0,
        endValue: cpuWeights.reduce((total, value) => total + value, 0),
        samples: cpuSamples,
        weights: cpuWeights,
      },
      {
        type: 'sampled',
        name: 'SSR allocations',
        unit: 'bytes',
        startValue: 0,
        endValue: heapWeights.reduce((total, value) => total + value, 0),
        samples: heapSamples,
        weights: heapWeights,
      },
    ],
    shared: { frames },
  }
}

export async function summarizeProfiles(cpuPath, heapPath, options = {}) {
  const name = options.name || 'SSR page'
  const prefix = options.prefix || 'ssr'
  const requests = options.requests || 1
  if (!/^[a-z0-9-]+$/.test(prefix) || !Number.isSafeInteger(requests) || requests < 1)
    throw new TypeError('Profile prefix and request count are invalid.')
  const cpuProfile = JSON.parse(readFileSync(cpuPath, 'utf8'))
  const heapProfile = JSON.parse(readFileSync(heapPath, 'utf8'))
  const resolveFrame = createFrameResolver()
  const analysis = {
    cpu: { ...summarizeCpuProfile(cpuProfile, resolveFrame), requests },
    memory: { ...summarizeHeapProfile(heapProfile, resolveFrame), requests },
    name,
    requests,
  }
  const directory = dirname(cpuPath)
  await Promise.all([
    writeFile(resolve(directory, `${prefix}-flamegraph.speedscope.json`), `${JSON.stringify(createSpeedscope(cpuProfile, heapProfile, resolveFrame, name))}\n`),
    writeFile(resolve(directory, `${prefix}-profile-analysis.json`), `${JSON.stringify(analysis, null, 2)}\n`),
    writeFile(resolve(directory, `${prefix}-profile-analysis.md`), renderProfileAnalysis(analysis)),
  ])
  return analysis
}

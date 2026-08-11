import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// eslint-disable-next-line test/no-import-node-test
import { it } from 'node:test'
import { pathToFileURL } from 'node:url'
import { renderProfileAnalysis } from './profile-report.mjs'
import { renderReport } from './report.mjs'
import { createFrameResolver, summarizeCpuProfile, summarizeHeapProfile } from './summarize.mjs'

function frame(functionName, url) {
  return { columnNumber: 0, functionName, lineNumber: 9, scriptId: '1', url }
}

function resolveFrame(value) {
  const module = value.url.includes('unhead') ? 'unhead' : 'vue'
  return {
    column: 0,
    group: module === 'unhead' ? 'seo' : 'generic',
    line: value.lineNumber + 1,
    module,
    name: value.functionName,
    source: value.url,
  }
}

it('summarizes self and inclusive profile costs', () => {
  const cpu = summarizeCpuProfile({
    nodes: [
      { callFrame: frame('(root)', 'node:internal'), children: [1, 3, 4], id: 0 },
      { callFrame: frame('renderSSRHead', '@unhead/vue'), children: [2], id: 1 },
      { callFrame: frame('renderToString', '@vue/server-renderer'), id: 2 },
      { callFrame: frame('(idle)', 'node:internal'), id: 3 },
      { callFrame: frame('post', 'node:inspector'), id: 4 },
    ],
    samples: [1, 2, 2, 3, 4],
    timeDeltas: [100, 200, 700, 900, 500],
  }, resolveFrame)
  const memory = summarizeHeapProfile({
    head: {
      callFrame: frame('(root)', 'node:internal'),
      children: [
        {
          callFrame: frame('renderSSRHead', '@unhead/vue'),
          children: [{ callFrame: frame('renderToString', '@vue/server-renderer'), children: [], selfSize: 8192 }],
          selfSize: 4096,
        },
      ],
      selfSize: 0,
    },
  }, resolveFrame)

  assert.equal(cpu.total, 1000)
  assert.equal(cpu.excluded, 1400)
  assert.deepEqual(cpu.self.map(row => [row.name, row.value, row.percent]), [
    ['renderToString', 900, 90],
    ['renderSSRHead', 100, 10],
  ])
  assert.equal(cpu.inclusive.find(row => row.name === 'renderSSRHead').value, 1000)
  assert.deepEqual(cpu.paths.find(row => row.name === 'renderSSRHead').path.map(row => row.name), ['renderSSRHead'])
  assert.equal(memory.self.find(row => row.name === 'renderSSRHead').value, 4096)
  assert.equal(memory.inclusive.find(row => row.name === 'renderSSRHead').value, 12288)
  assert.equal(memory.modules.find(row => row.name === 'unhead').group, 'seo')
  assert.equal(memory.modules.find(row => row.name === 'unhead').inclusive, 12288)
})

it('attributes empty source maps through bundle regions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nuxt-seo-profile-'))
  const generated = join(directory, 'entry.mjs')
  const source = '../../node_modules/.pnpm/nuxt-seo-utils@1.0.0/node_modules/nuxt-seo-utils/dist/runtime.mjs'
  await writeFile(generated, `//#region ${source}\nfunction minifyJS() {}\n//#endregion\n`)
  await writeFile(`${generated}.map`, JSON.stringify({ mappings: '', names: [], sources: [source], version: 3 }))

  const resolved = createFrameResolver()({ ...frame('minifyJS', pathToFileURL(generated).href), lineNumber: 1 })

  assert.equal(resolved.group, 'seo')
  assert.equal(resolved.module, 'nuxt-seo-utils')
  assert.equal(resolved.source, 'nuxt-seo-utils/dist/runtime.mjs')
  await rm(directory, { recursive: true })
})

it('does not attribute frames to unclosed bundle regions', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nuxt-seo-profile-'))
  const generated = join(directory, 'nitro.mjs')
  const source = '../../node_modules/nuxt-seo-utils/dist/runtime.mjs'
  await writeFile(generated, `//#region ${source}\nfunction unrelated() {}\n`)
  await writeFile(`${generated}.map`, JSON.stringify({ mappings: '', names: [], sources: [], version: 3 }))

  const resolved = createFrameResolver()({ ...frame('(anonymous)', pathToFileURL(generated).href), lineNumber: 1 })

  assert.equal(resolved.group, 'generic')
  assert.equal(resolved.source, generated)
  await rm(directory, { recursive: true })
})

it('deduplicates equivalent named sources from peer variants', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nuxt-seo-profile-'))
  const generated = join(directory, 'nitro.mjs')
  const sources = [
    'node_modules/.pnpm/site-config-stack@4.1.0/node_modules/site-config-stack/dist/index.mjs',
    'node_modules/.pnpm/site-config-stack@4.2.0/node_modules/site-config-stack/dist/index.mjs',
  ]
  await writeFile(generated, 'function bundled() {}\n')
  for (const source of sources) {
    const path = join(directory, source)
    await mkdir(join(path, '..'), { recursive: true })
    await writeFile(path, '\nfunction envSiteConfig() {}\n')
  }
  await writeFile(`${generated}.map`, JSON.stringify({ mappings: '', names: [], sources, version: 3 }))

  const resolved = createFrameResolver()(frame('envSiteConfig', pathToFileURL(generated).href))

  assert.equal(resolved.attribution, 'function')
  assert.equal(resolved.module, 'nuxt-site-config')
  assert.equal(resolved.line, 2)
  await rm(directory, { recursive: true })
})

it('does not double count recursive inclusive costs', () => {
  const cpu = summarizeCpuProfile({
    nodes: [
      { callFrame: frame('(root)', 'node:internal'), children: [1], id: 0 },
      { callFrame: frame('walkResolver', '@unhead/vue'), children: [2], id: 1 },
      { callFrame: frame('walkResolver', '@unhead/vue'), id: 2 },
    ],
    samples: [2],
    timeDeltas: [100],
  }, resolveFrame)
  const memory = summarizeHeapProfile({
    head: {
      callFrame: frame('(root)', 'node:internal'),
      children: [{
        callFrame: frame('walkResolver', '@unhead/vue'),
        children: [{ callFrame: frame('walkResolver', '@unhead/vue'), children: [], selfSize: 100 }],
        selfSize: 0,
      }],
      selfSize: 0,
    },
  }, resolveFrame)

  assert.equal(cpu.inclusive.find(row => row.name === 'walkResolver').value, 100)
  assert.equal(memory.inclusive.find(row => row.name === 'walkResolver').value, 100)
})

it('keeps SEO frames below the global hotspot cutoff', () => {
  const children = Array.from({ length: 102 }, (_, index) => index + 1)
  const nodes = [
    { callFrame: frame('(root)', 'node:internal'), children, id: 0 },
    ...children.map(id => ({
      callFrame: frame(`function${id}`, id === 102 ? '@unhead/vue' : `generic-${id}.mjs`),
      id,
    })),
  ]
  const cpu = summarizeCpuProfile({
    nodes,
    samples: children,
    timeDeltas: children.map(id => 103 - id),
  }, resolveFrame)

  assert.ok(cpu.self.length > 100)
  assert.equal(cpu.self.find(row => row.name === 'function102').group, 'seo')
})

it('renders a decision-first workload summary', () => {
  const base = {
    benches: [
      { id: 'ssr-cpu', kind: 'time', name: 'SSR page CPU', rme: 0.5, value: 10 },
      { id: 'ssr-wall', informational: true, kind: 'time', name: 'SSR page wall', rme: 0.5, value: 13 },
      { id: 'ssr-alloc', kind: 'memory', name: 'SSR page allocated', value: 100_000 },
    ],
  }
  const head = {
    benches: [
      { id: 'ssr-cpu', kind: 'time', name: 'SSR page CPU', rme: 0.5, value: 12 },
      { id: 'ssr-wall', informational: true, kind: 'time', name: 'SSR page wall', rme: 0.5, value: 13.1 },
      { id: 'ssr-alloc', kind: 'memory', name: 'SSR page allocated', value: 101_000 },
    ],
    profiles: {
      cpu: {
        paths: [{ group: 'seo', inclusive: 150, line: 10, module: 'unhead', name: 'renderSSRHead', path: [{ name: 'renderSSRHead' }], percent: 15, self: 50, source: '@unhead/vue' }],
      },
      memory: {
        paths: [{ group: 'generic', inclusive: 8192, line: 20, name: 'renderToString', path: [{ name: 'renderToString' }], percent: 8, self: 4096, source: '@vue/server-renderer' }],
      },
    },
  }

  const report = renderReport(base, head, 'main @ abc123')

  assert.match(report, /^### ⚡ SSR Performance/)
  assert.match(report, /SSR page CPU regressed by 2\.00 ms per request \(20\.0%\)/)
  assert.match(report, /\| Workload \| CPU \/ request \| Wall \/ request \| Allocation \/ request \|/)
  assert.match(report, /\| \*\*SSR page\*\* \| 12\.00 ms<br>🔴 20\.0% slower \| 13\.10 ms<br>no clear change \| 98\.6 KiB<br>no clear change \|/)
  assert.match(report, /Allocation is sampled V8 heap churn per request, not retained memory/)
  assert.match(report, /<details><summary>Current SSR hotspots<\/summary>/)
  assert.match(report, /\| Function \| Module \| Total \/ request \| Self \/ request \|/)
  assert.match(report, /renderSSRHead.+unhead.+0\.15 ms \(15\.0%\).+0\.05 ms/)
})

it('uses sampled allocation churn when profiles are available', () => {
  function run(total) {
    return {
      benches: [{ id: 'ssr-alloc', kind: 'memory', name: 'SSR page allocated', value: 100_000 }],
      profiles: {
        ssr: {
          cpu: { modules: [], paths: [] },
          memory: { modules: [], paths: [], total },
          requests: 10,
        },
      },
    }
  }

  const report = renderReport(run(1_024_000), run(819_200))

  assert.match(report, /SSR page allocation fell by 20\.0 KiB per request \(20\.0%\)/)
  assert.match(report, /\| \*\*SSR page\*\* \| — \| — \| 80\.0 KiB<br>🟢 20\.0% less \|/)
})

it('explains when hotspot attribution falls back to generic functions', () => {
  const head = {
    benches: [],
    profiles: {
      cpu: {
        paths: [{ group: 'generic', inclusive: 80, line: 20, name: 'renderToString', path: [{ name: 'renderToString' }], percent: 8, self: 80, source: '@vue/server-renderer' }],
      },
      memory: { paths: [] },
    },
  }

  const report = renderReport(null, head)

  assert.match(report, /No named Unhead or Nuxt SEO functions were resolved/)
  assert.match(report, /renderToString.+0\.08 ms \(8\.0%\).+0\.08 ms/)
})

it('renders full and SEO focused profile analysis', () => {
  const path = [{ name: 'renderSSRHead' }]
  const seoRow = { group: 'seo', inclusive: 100, line: 10, module: 'unhead', name: 'renderSSRHead', path, percent: 25, self: 50, source: '@unhead/vue', value: 50 }
  const genericRow = { ...seoRow, group: 'generic', module: 'vue', name: 'renderToString', percent: 75, value: 150 }
  const profile = {
    excluded: 0,
    inclusive: [genericRow, seoRow],
    modules: [
      { group: 'generic', inclusive: 150, inclusivePercent: 75, name: 'vue', self: 150, selfPercent: 75 },
      { group: 'seo', inclusive: 100, inclusivePercent: 50, name: 'unhead', self: 50, selfPercent: 25 },
    ],
    paths: [genericRow, seoRow],
    self: [genericRow, seoRow],
    total: 200,
    requests: 1,
    unit: 'microseconds',
  }

  const report = renderProfileAnalysis({ cpu: profile, memory: { ...profile, unit: 'bytes' } })

  assert.match(report, /## CPU self cost[\s\S]+renderToString/)
  assert.match(report, /## Nuxt SEO CPU self cost[\s\S]+renderSSRHead/)
  assert.match(report, /## Nuxt SEO CPU caller paths/)
})

it('combines sampled module costs by workload', () => {
  function workload(cpu, memory) {
    const module = (inclusive, unit) => ({
      group: 'seo',
      inclusive,
      inclusivePercent: 20,
      name: 'nuxt-seo-utils',
      self: inclusive / 2,
      selfPercent: 10,
      unit,
    })
    return {
      cpu: { modules: [module(cpu, 'microseconds')], paths: [], requests: 100 },
      memory: { modules: [module(memory, 'bytes')], paths: [], requests: 100 },
      name: 'SSR page',
      requests: 100,
    }
  }
  const base = { benches: [], profiles: { ssr: workload(100_000, 1_024_000) } }
  const head = { benches: [], profiles: { ssr: workload(120_000, 2_048_000) } }

  const report = renderReport(base, head)

  assert.match(report, /<details><summary>Nuxt SEO module breakdown<\/summary>/)
  assert.match(report, /\| Module \| CPU \/ request \| Change \| Allocation \/ request \| Change \|/)
  assert.match(report, /nuxt-seo-utils.+1\.200 ms.+\+20\.0%.+20\.0 KiB.+\+100\.0%/)
})

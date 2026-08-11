#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const TIME_FLOOR_PERCENT = 5
const MEMORY_FLOOR_PERCENT = 2.5
const MEMORY_FLOOR_BYTES = 16 * 1024

function formatBytes(bytes) {
  const absolute = Math.abs(bytes)
  if (absolute >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
  return `${(bytes / 1024).toFixed(1)} KiB`
}

function formatValue(bench) {
  return bench.kind === 'time' ? `${bench.value.toFixed(2)} ms` : formatBytes(bench.value)
}

function formatPercent(percent) {
  return `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`
}

function escapeCell(value) {
  return String(value).replaceAll('|', '&#124;').replace(/[\r\n]+/g, ' ')
}

function profileWorkloads(profiles) {
  if (!profiles)
    return []
  if (profiles.cpu && profiles.memory)
    return [['ssr', profiles]]
  return Object.entries(profiles).filter(([, profile]) => profile?.cpu && profile?.memory)
}

function profileForBench(run, bench) {
  if (!run?.profiles || !bench.id.endsWith('-alloc'))
    return
  const workload = bench.id.slice(0, -'-alloc'.length)
  if (run.profiles.cpu && workload === 'ssr')
    return run.profiles
  const key = workload === 'ai-ready' ? 'aiReady' : workload
  return run.profiles[key]
}

function reportBenches(run) {
  return (run?.benches || []).map((bench) => {
    const profile = profileForBench(run, bench)
    const requests = profile?.requests || profile?.memory?.requests
    const total = profile?.memory?.total
    if (!requests || !Number.isFinite(total))
      return bench
    return { ...bench, value: total / requests }
  })
}

function profileDelta(base, head) {
  if (!base)
    return 'new'
  return base === 0 ? 'new' : formatPercent((head - base) / Math.abs(base) * 100)
}

function profileValue(profile, row, requests) {
  return row ? row.inclusive / (profile?.requests || requests || 1) : undefined
}

function profileMetric(profile, row, requests, unit) {
  const value = profileValue(profile, row, requests)
  if (value === undefined)
    return '—'
  return unit === 'bytes' ? formatBytes(value) : `${(value / 1000).toFixed(3)} ms`
}

function profileChange(baseProfile, baseRow, headProfile, headRow, requests) {
  const baseValue = profileValue(baseProfile, baseRow, requests)
  const headValue = profileValue(headProfile, headRow, requests)
  return headValue === undefined ? '—' : profileDelta(baseValue, headValue)
}

function moduleRows(profile) {
  const cpu = new Map((profile.cpu?.modules || []).filter(row => row.group === 'seo').map(row => [row.name, row]))
  const memory = new Map((profile.memory?.modules || []).filter(row => row.group === 'seo').map(row => [row.name, row]))
  return [...new Set([...cpu.keys(), ...memory.keys()])]
    .map(name => ({ cpu: cpu.get(name), memory: memory.get(name), name }))
    .sort((left, right) => Math.max(right.cpu?.inclusivePercent || 0, right.memory?.inclusivePercent || 0) - Math.max(left.cpu?.inclusivePercent || 0, left.memory?.inclusivePercent || 0))
    .slice(0, 6)
}

function renderProfileModuleDiff(baseProfiles, headProfiles) {
  if (!baseProfiles || !headProfiles)
    return []
  const bases = new Map(profileWorkloads(baseProfiles))
  const output = [
    '<details><summary>Nuxt SEO module breakdown</summary>',
    '',
    'Inclusive values include descendant work, so module rows can overlap. Use these sampled changes to find likely causes.',
  ]
  for (const [key, head] of profileWorkloads(headProfiles)) {
    const base = bases.get(key)
    if (!base)
      continue
    const rows = moduleRows(head)
    if (!rows.length)
      continue
    const baseCpu = new Map((base.cpu?.modules || []).map(row => [row.name, row]))
    const baseMemory = new Map((base.memory?.modules || []).map(row => [row.name, row]))
    output.push('', `#### ${escapeCell(head.name || key)}`, '')
    output.push('| Module | CPU / request | Change | Allocation / request | Change |', '|---|---:|---:|---:|---:|')
    for (const row of rows) {
      output.push(`| ${escapeCell(row.name)} | ${profileMetric(head.cpu, row.cpu, head.requests, 'microseconds')} | ${profileChange(base.cpu, baseCpu.get(row.name), head.cpu, row.cpu, head.requests)} | ${profileMetric(head.memory, row.memory, head.requests, 'bytes')} | ${profileChange(base.memory, baseMemory.get(row.name), head.memory, row.memory, head.requests)} |`)
    }
  }
  output.push('', '</details>')
  return output.length > 5 ? output : []
}

function classify(head, base) {
  if (!base)
    return { _tag: 'New', head }
  const difference = head.value - base.value
  const percent = base.value === 0 ? 0 : difference / Math.abs(base.value) * 100
  const threshold = head.kind === 'time'
    ? Math.max(TIME_FLOOR_PERCENT, 2 * ((base.rme || 0) + (head.rme || 0)))
    : MEMORY_FLOOR_PERCENT
  const changed = head.kind === 'time'
    ? Math.abs(percent) > threshold
    : Math.abs(difference) > MEMORY_FLOOR_BYTES && (base.value === 0 || Math.abs(percent) > threshold)
  if (!changed)
    return { _tag: 'Same', base, head, difference, percent }
  return { _tag: difference > 0 ? 'Slower' : 'Faster', base, head, difference, percent }
}

function deltaDescription(row) {
  if (row._tag === 'New')
    return 'new measurement'
  if (row._tag === 'Same')
    return 'no clear change'
  const icon = row._tag === 'Slower' ? '🔴' : '🟢'
  const direction = row.head.kind === 'time'
    ? row._tag === 'Slower' ? 'slower' : 'faster'
    : row._tag === 'Slower' ? 'more' : 'less'
  return `${icon} ${Math.abs(row.percent).toFixed(1)}% ${direction}`
}

function metricSubject(row) {
  return row.head.name.replace(/ allocated$/, ' allocation')
}

function outcomeDescription(row) {
  const amount = row.head.kind === 'time'
    ? `${Math.abs(row.difference).toFixed(2)} ms`
    : formatBytes(Math.abs(row.difference))
  const verb = row.head.kind === 'time'
    ? row._tag === 'Slower' ? 'regressed' : 'improved'
    : row._tag === 'Slower' ? 'grew' : 'fell'
  return `${escapeCell(metricSubject(row))} ${verb} by ${amount} per request (${Math.abs(row.percent).toFixed(1)}%)`
}

function renderOutcome(significant) {
  const slower = significant.filter(row => row._tag === 'Slower')
  const faster = significant.filter(row => row._tag === 'Faster')
  if (slower.length === 1 && faster.length === 0)
    return `🔴 **${outcomeDescription(slower[0])}.**`
  if (faster.length === 1 && slower.length === 0)
    return `🟢 **${outcomeDescription(faster[0])}.**`
  if (slower.length)
    return `⚠️ **${slower.length} regression${slower.length === 1 ? '' : 's'} and ${faster.length} improvement${faster.length === 1 ? '' : 's'} passed the noise gate.**`
  if (faster.length)
    return `🟢 **${faster.length} measurements improved beyond CI noise.**`
  return '✅ **No clear performance change.**'
}

function benchmarkWorkloads(rows) {
  const workloads = new Map()
  for (const row of rows) {
    const match = row.head.id.match(/^(.*)-(cpu|wall|alloc)$/)
    if (!match)
      continue
    const [, id, metric] = match
    const workload = workloads.get(id) || {
      id,
      name: row.head.name.replace(/ (?:CPU|wall|allocated)$/, ''),
    }
    workload[metric] = row
    workloads.set(id, workload)
  }
  return [...workloads.values()]
}

function benchmarkCell(row) {
  return row ? `${formatValue(row.head)}<br>${deltaDescription(row)}` : '—'
}

function renderBenchmarkSummary(rows) {
  const workloads = benchmarkWorkloads(rows)
  if (!workloads.length)
    return []
  const output = [
    '| Workload | CPU / request | Wall / request | Allocation / request |',
    '|---|---:|---:|---:|',
  ]
  for (const workload of workloads)
    output.push(`| **${escapeCell(workload.name)}** | ${benchmarkCell(workload.cpu)} | ${benchmarkCell(workload.wall)} | ${benchmarkCell(workload.alloc)} |`)
  return output
}

function renderMeasurementDetails(rows) {
  const output = [
    '<details><summary>All measurements and uncertainty</summary>',
    '',
    '| Measurement | Base | PR | Change | Uncertainty |',
    '|---|---:|---:|---:|---:|',
  ]
  for (const row of rows) {
    const base = row._tag === 'New' ? '—' : formatValue(row.base)
    const uncertainty = row.head.rme === undefined ? '—' : `±${row.head.rme.toFixed(1)}%`
    output.push(`| ${escapeCell(row.head.name)} | ${base} | ${formatValue(row.head)} | ${deltaDescription(row)} | ${uncertainty} |`)
  }
  output.push('', '</details>')
  return output
}

function renderHotspots(profiles) {
  const profile = profiles?.ssr || profiles
  if (!profile)
    return []
  const seoCpu = profile.cpu.paths.filter(row => row.group === 'seo')
  const seoMemory = profile.memory.paths.filter(row => row.group === 'seo')
  const filtered = seoCpu.length > 0 || seoMemory.length > 0
  const named = rows => rows.filter(row => row.name !== '(anonymous)')
  const cpu = named(seoCpu.length > 0 ? seoCpu : profile.cpu.paths).slice(0, 6)
  const memory = named(seoMemory.length > 0 ? seoMemory : profile.memory.paths).slice(0, 6)
  const requests = profile.requests || 1
  const output = [
    '<details><summary>Current SSR hotspots</summary>',
    '',
    filtered
      ? 'Filtered to Unhead and Nuxt SEO functions. Total values include descendant work.'
      : 'No named Unhead or Nuxt SEO functions were resolved. Showing generic functions.',
  ]
  if (cpu.length) {
    output.push('', '#### CPU', '', '| Function | Module | Total / request | Self / request |', '|---|---|---:|---:|')
    for (const row of cpu)
      output.push(`| ${escapeCell(row.name)} | ${escapeCell(row.module || '—')} | ${(row.inclusive / requests / 1000).toFixed(2)} ms (${row.percent.toFixed(1)}%) | ${(row.self / requests / 1000).toFixed(2)} ms |`)
  }
  if (memory.length) {
    output.push('', '#### Allocation', '', '| Function | Module | Total / request | Self / request |', '|---|---|---:|---:|')
    for (const row of memory)
      output.push(`| ${escapeCell(row.name)} | ${escapeCell(row.module || '—')} | ${formatBytes(row.inclusive / requests)} (${row.percent.toFixed(1)}%) | ${formatBytes(row.self / requests)} |`)
  }
  output.push('', 'The workflow artifact contains caller paths, raw profiles, and the Speedscope flamegraph.', '', '</details>')
  return output
}

export function renderReport(baseRun, headRun, baseLabel = '') {
  const baseBenches = new Map(reportBenches(baseRun).map(bench => [bench.id, bench]))
  const rows = reportBenches(headRun).map(head => classify(head, baseBenches.get(head.id)))
  const significant = rows.filter(row => !row.head.informational && ['Slower', 'Faster'].includes(row._tag))
  const output = ['### ⚡ SSR Performance', '', renderOutcome(significant), '', ...renderBenchmarkSummary(rows)]
  output.push(
    '',
    '<details><summary>How to read this report</summary>',
    '',
    '- CPU and wall values are averages for one request.',
    '- Allocation is sampled V8 heap churn per request, not retained memory.',
    '- “No clear change” means the result stayed inside expected CI noise.',
    `- Green or red needs more than ${TIME_FLOOR_PERCENT}% plus uncertainty for time, or ${MEMORY_FLOOR_PERCENT}% and 16 KiB for allocation.`,
    '',
    '</details>',
    '',
    ...renderMeasurementDetails(rows),
    '',
    ...renderProfileModuleDiff(baseRun?.profiles, headRun.profiles),
    '',
    ...renderHotspots(headRun.profiles),
  )
  if (baseLabel)
    output.push('', `<sub>Baseline: ${escapeCell(baseLabel)}. Base and PR ran on the same runner.</sub>`)
  return `${output.join('\n')}\n`
}

function readRun(path) {
  return path && existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const head = readRun(process.env.PR_PERF)
  if (!head)
    throw new TypeError('PR_PERF must point to a benchmark result.')
  process.stdout.write(renderReport(readRun(process.env.BASE_PERF), head, process.env.BASE_LABEL))
}

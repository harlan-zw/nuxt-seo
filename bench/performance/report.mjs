#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const TIME_FLOOR_PERCENT = 5
const MEMORY_FLOOR_PERCENT = 3
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

function profileDelta(base, head) {
  if (!base)
    return 'new'
  return base === 0 ? 'new' : formatPercent((head - base) / Math.abs(base) * 100)
}

function renderProfileModuleRows(output, unit, baseProfile, headProfile) {
  const baseRows = new Map((baseProfile?.modules || []).map(row => [row.name, row]))
  const rows = headProfile.modules
    .filter(row => row.group === 'seo')
    .slice(0, 6)
  if (!rows.length)
    return
  const value = (profile, row) => row.inclusive / (profile.requests || 1)
  const format = unit === 'bytes'
    ? formatBytes
    : micros => `${(micros / 1000).toFixed(3)} ms`
  output.push('', unit === 'bytes' ? '**Allocation churn**' : '**CPU**', '')
  output.push('| Module | base | PR | Δ |', '|---|---:|---:|---:|')
  for (const row of rows) {
    const baseRow = baseRows.get(row.name)
    const baseValue = baseRow ? value(baseProfile, baseRow) : undefined
    const headValue = value(headProfile, row)
    output.push(`| ${escapeCell(row.name)} | ${baseValue === undefined ? '—' : format(baseValue)} | ${format(headValue)} | ${profileDelta(baseValue, headValue)} |`)
  }
}

function renderProfileModuleDiff(baseProfiles, headProfiles) {
  if (!baseProfiles || !headProfiles)
    return []
  const bases = new Map(profileWorkloads(baseProfiles))
  const output = [
    '### 🧭 Sampled Nuxt SEO module costs',
    '',
    'Inclusive costs include descendant work. Modules overlap. Treat sampled deltas as diagnostic signals.',
  ]
  for (const [key, head] of profileWorkloads(headProfiles)) {
    const base = bases.get(key)
    if (!base)
      continue
    output.push('', `<details><summary>${escapeCell(head.name || key)}</summary>`)
    renderProfileModuleRows(output, 'microseconds', base.cpu, head.cpu)
    renderProfileModuleRows(output, 'bytes', base.memory, head.memory)
    output.push('', '</details>')
  }
  return output.length > 3 ? output : []
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

function deltaCell(row) {
  if (row._tag === 'New')
    return '🆕 new'
  if (row._tag === 'Same')
    return '~ noise'
  const icon = row._tag === 'Slower' ? '🔴' : '🟢'
  if (row.head.kind === 'time')
    return `${icon} ${formatPercent(row.percent)}`
  const sign = row.difference > 0 ? '+' : '-'
  return `${icon} ${sign}${formatBytes(Math.abs(row.difference))} (${formatPercent(row.percent)})`
}

function renderHotspots(profiles) {
  const profile = profiles?.ssr || profiles
  if (!profile)
    return []
  const seoCpu = profile.cpu.paths.filter(row => row.group === 'seo')
  const seoMemory = profile.memory.paths.filter(row => row.group === 'seo')
  const filtered = seoCpu.length > 0 || seoMemory.length > 0
  const cpu = (seoCpu.length > 0 ? seoCpu : profile.cpu.paths).slice(0, 8)
  const memory = (seoMemory.length > 0 ? seoMemory : profile.memory.paths).slice(0, 8)
  const requests = profile.requests || 1
  const output = [
    '### 🔥 SSR profile hotspots',
    '',
    filtered
      ? 'Filtered to Unhead and Nuxt SEO module frames. Values include descendant work.'
      : 'No named Unhead or Nuxt SEO frames were resolved. Showing generic frames.',
  ]
  if (cpu.length) {
    output.push('', '**CPU**', '', '| Inclusive | Self | Function | Caller path |', '|---:|---:|---|---|')
    for (const row of cpu) {
      const path = row.path.slice(-6).map(frame => frame.name).join(' → ')
      output.push(`| ${row.percent.toFixed(1)}% | ${(row.self / requests / 1000).toFixed(2)} ms | ${escapeCell(row.name)} | ${escapeCell(path)} |`)
    }
  }
  if (memory.length) {
    output.push('', '**Memory**', '', '| Inclusive | Self | Function | Caller path |', '|---:|---:|---|---|')
    for (const row of memory) {
      const path = row.path.slice(-6).map(frame => frame.name).join(' → ')
      output.push(`| ${formatBytes(row.inclusive / requests)} (${row.percent.toFixed(1)}%) | ${formatBytes(row.self / requests)} | ${escapeCell(row.name)} | ${escapeCell(path)} |`)
    }
  }
  output.push('', '<sub>Download the artifact for the full Markdown, JSON, raw profiles, and Speedscope flamegraph.</sub>')
  return output
}

export function renderReport(baseRun, headRun, baseLabel = '') {
  const rows = headRun.benches.map(head => classify(head, baseRun?.benches.find(base => base.id === head.id)))
  const significant = rows.filter(row => !row.head.informational && ['Slower', 'Faster'].includes(row._tag))
  const slower = significant.filter(row => row._tag === 'Slower')
  const output = ['### ⚡ SSR Performance', '']
  if (slower.length)
    output.push(`⚠️ **${slower.length} slower metric${slower.length === 1 ? '' : 's'}** past the noise gate.`)
  else if (significant.length)
    output.push(`🟢 **${significant.length} faster metric${significant.length === 1 ? '' : 's'}**.`)
  else
    output.push('✅ **No significant change** within CI noise.')

  if (significant.length) {
    output.push('', '| Benchmark | base → PR | Δ |', '|---|---|---|')
    for (const row of significant)
      output.push(`| **${escapeCell(row.head.name)}** | ${formatValue(row.base)} → ${formatValue(row.head)} | ${deltaCell(row)} |`)
  }

  output.push('', `<details><summary>All benchmarks (${rows.length})</summary>`, '')
  output.push('| Benchmark | PR | Δ | RME |', '|---|---:|---:|---:|')
  for (const row of rows) {
    const rme = row.head.rme === undefined ? '—' : `±${row.head.rme.toFixed(1)}%`
    output.push(`| ${escapeCell(row.head.name)} | ${formatValue(row.head)} | ${deltaCell(row)} | ${rme} |`)
  }
  output.push(
    '',
    '</details>',
    '',
    ...renderProfileModuleDiff(baseRun?.profiles, headRun.profiles),
    '',
    ...renderHotspots(headRun.profiles),
  )
  if (baseLabel)
    output.push('', `<sub>Baseline: ${escapeCell(baseLabel)}. Base and PR ran on the same runner. CPU gate: 5% plus uncertainty. Memory gate: 3% and 16 KiB.</sub>`)
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

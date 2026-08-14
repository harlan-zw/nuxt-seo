function formatBytes(bytes) {
  if (Math.abs(bytes) >= 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
  return `${(bytes / 1024).toFixed(1)} KiB`
}

function formatValue(value, unit) {
  return unit === 'bytes' ? formatBytes(value) : `${(value / 1000).toFixed(2)} ms`
}

function escapeCell(value) {
  return String(value).replaceAll('|', '&#124;').replace(/[\r\n]+/g, ' ')
}

function renderCostTable(output, title, profile, rows, valueKey = 'value') {
  output.push('', `## ${title}`, '', '| Cost | Function | Module | Source |', '|---:|---|---|---|')
  for (const row of rows.slice(0, 25)) {
    const value = row[valueKey] / (profile.requests || 1)
    output.push(`| ${formatValue(value, profile.unit)} (${row.percent.toFixed(1)}%) | ${escapeCell(row.name)} | ${escapeCell(row.module)} | ${escapeCell(`${row.source}:${row.line}`)} |`)
  }
}

function renderPaths(output, title, profile, rows = profile.paths) {
  output.push('', `## ${title}`, '', '| Inclusive | Self | Call path |', '|---:|---:|---|')
  for (const row of rows.slice(0, 20)) {
    const path = row.path.slice(-12).map(frame => frame.name).join(' → ')
    const requests = profile.requests || 1
    output.push(`| ${formatValue(row.inclusive / requests, profile.unit)} (${row.percent.toFixed(1)}%) | ${formatValue(row.self / requests, profile.unit)} | ${escapeCell(path)} |`)
  }
}

export function renderProfileAnalysis(analysis) {
  const modules = new Map()
  for (const row of analysis.cpu.modules)
    modules.set(row.name, { cpu: row, memory: undefined })
  for (const row of analysis.memory.modules) {
    const current = modules.get(row.name) || { cpu: undefined, memory: undefined }
    current.memory = row
    modules.set(row.name, current)
  }
  const orderedModules = [...modules]
    .sort((left, right) => (right[1].cpu?.inclusive || 0) - (left[1].cpu?.inclusive || 0))

  const output = [
    `# ${analysis.name || 'SSR'} profile analysis`,
    '',
    `Profiled ${analysis.requests || 1} requests. Cost values are per request.`,
    `CPU percentages use ${formatValue(analysis.cpu.total, analysis.cpu.unit)} of active samples. Idle and profiler control samples are excluded.`,
    `Memory percentages use ${formatBytes(analysis.memory.total)} of sampled allocation churn, including collected objects.`,
    `CPU attribution: ${(analysis.cpu.attribution || []).map(row => `${row.name} ${row.percent.toFixed(1)}%`).join(', ') || 'custom resolver'}.`,
    `Memory attribution: ${(analysis.memory.attribution || []).map(row => `${row.name} ${row.percent.toFixed(1)}%`).join(', ') || 'custom resolver'}.`,
    '',
    '## Module cost',
    '',
    '| Module | CPU inclusive | CPU self | Allocation inclusive | Allocation self |',
    '|---|---:|---:|---:|---:|',
  ]
  for (const [name, value] of orderedModules) {
    const cpuInclusive = value.cpu ? `${formatValue(value.cpu.inclusive / analysis.cpu.requests, analysis.cpu.unit)} (${value.cpu.inclusivePercent.toFixed(1)}%)` : '—'
    const cpuSelf = value.cpu ? `${formatValue(value.cpu.self / analysis.cpu.requests, analysis.cpu.unit)} (${value.cpu.selfPercent.toFixed(1)}%)` : '—'
    const memoryInclusive = value.memory ? `${formatBytes(value.memory.inclusive / analysis.memory.requests)} (${value.memory.inclusivePercent.toFixed(1)}%)` : '—'
    const memorySelf = value.memory ? `${formatBytes(value.memory.self / analysis.memory.requests)} (${value.memory.selfPercent.toFixed(1)}%)` : '—'
    output.push(`| ${escapeCell(name)} | ${cpuInclusive} | ${cpuSelf} | ${memoryInclusive} | ${memorySelf} |`)
  }
  output.push('', 'Inclusive module costs overlap when one module calls another. Do not sum them.')

  renderCostTable(output, 'CPU self cost', analysis.cpu, analysis.cpu.self)
  renderCostTable(output, 'CPU inclusive cost', analysis.cpu, analysis.cpu.inclusive)
  renderPaths(output, 'CPU caller paths', analysis.cpu)
  renderCostTable(output, 'Allocation self cost', analysis.memory, analysis.memory.self)
  renderCostTable(output, 'Allocation inclusive cost', analysis.memory, analysis.memory.inclusive)
  renderPaths(output, 'Allocation caller paths', analysis.memory)
  const seo = {
    cpuInclusive: analysis.cpu.inclusive.filter(row => row.group === 'seo'),
    cpuPaths: analysis.cpu.paths.filter(row => row.group === 'seo'),
    cpuSelf: analysis.cpu.self.filter(row => row.group === 'seo'),
    memoryInclusive: analysis.memory.inclusive.filter(row => row.group === 'seo'),
    memoryPaths: analysis.memory.paths.filter(row => row.group === 'seo'),
    memorySelf: analysis.memory.self.filter(row => row.group === 'seo'),
  }
  if (Object.values(seo).some(rows => rows.length > 0)) {
    renderCostTable(output, 'Nuxt SEO CPU self cost', analysis.cpu, seo.cpuSelf)
    renderCostTable(output, 'Nuxt SEO CPU inclusive cost', analysis.cpu, seo.cpuInclusive)
    renderPaths(output, 'Nuxt SEO CPU caller paths', analysis.cpu, seo.cpuPaths)
    renderCostTable(output, 'Nuxt SEO allocation self cost', analysis.memory, seo.memorySelf)
    renderCostTable(output, 'Nuxt SEO allocation inclusive cost', analysis.memory, seo.memoryInclusive)
    renderPaths(output, 'Nuxt SEO allocation caller paths', analysis.memory, seo.memoryPaths)
  }
  output.push('', '<sub>Raw profiles and the Speedscope flamegraph remain authoritative.</sub>', '')
  return output.join('\n')
}

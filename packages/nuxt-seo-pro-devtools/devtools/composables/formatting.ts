export function formatNumber(n: number | null | undefined): string {
  if (n == null)
    return '\u2014'
  if (n >= 1000000)
    return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)
    return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export function formatCtr(val: number): string {
  return `${(val * 100).toFixed(1)}%`
}

export function formatPosition(val: number): string {
  return val.toFixed(1)
}

export function fmtGscMetric(val: number, metric: string): string {
  if (metric === 'ctr')
    return formatCtr(val)
  if (metric === 'position')
    return formatPosition(val)
  return formatNumber(val)
}

export function calcTrendPercent(current: number, prev: number, invert = false): number {
  if (!prev)
    return 0
  const pct = Math.round(((current - prev) / prev) * 100) || 0
  return (invert ? -pct : pct) || 0
}

export function getPath(url: string): string {
  if (!url?.startsWith('http'))
    return url || '/'
  return new URL(url).pathname || '/'
}

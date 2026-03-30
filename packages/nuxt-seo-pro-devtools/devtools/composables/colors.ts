export interface VizColorSet {
  dot: string
  bg: string
  text: string
  hex: string
}

export const gscMetricColors = {
  clicks: { dot: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-400', hex: '#3b82f6' },
  impressions: { dot: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-400', hex: '#a855f7' },
  ctr: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400', hex: '#34d399' },
  position: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', hex: '#f97316' },
} as const satisfies Record<string, VizColorSet>

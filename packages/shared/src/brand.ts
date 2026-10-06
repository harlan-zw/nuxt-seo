import type { NuxtSEOModule } from './const'

/**
 * Nuxt SEO brand marks as data, plus one pure SVG renderer.
 *
 * One pen draws every mark. Only the landing dot carries colour:
 * green means a free module shipped it, violet means Pro read it back.
 * nuxtseo.com, the devtools client, READMEs and favicons all draw from here.
 */

/** Every module with a hand-drawn icon. The meta `nuxt-seo` module uses the summit mark instead. */
export type ModuleIconName = Exclude<NuxtSEOModule['slug'], 'nuxt-seo' | 'ai-kit'>
export type BrandIconName = ModuleIconName | 'mcp'

/** Colour of the landing dot. `free`: a module shipped it. `pro`: Pro read it back. */
export type BrandLanding = 'free' | 'pro' | 'ink' | 'none'
export type BrandProduct = 'free' | 'pro'

export type BrandPaint = 'ink' | 'free' | 'pro' | 'pro-gradient' | 'tile' | 'tile-ink'

export type BrandShape
  = | { _tag: 'Line', d: string, width: number, paint: BrandPaint, opacity?: number, dash?: string }
    | { _tag: 'Area', d: string, paint: BrandPaint }
    | { _tag: 'Dot', cx: number, cy: number, r: number, paint: BrandPaint }
    | { _tag: 'Ring', cx: number, cy: number, r: number, width: number, paint: BrandPaint }
    | { _tag: 'Tile', size: number, radius: number, paint: BrandPaint }

export interface BrandGroup {
  transform?: string
  shapes: BrandShape[]
}

export interface BrandDrawing {
  viewBox: string
  label: string
  groups: BrandGroup[]
}

export interface BrandPalette {
  ink: string
  free: string
  pro: string
  gradientFrom: string
  gradientTo: string
  tile: string
  tileInk: string
}

/** Static palettes for contexts without CSS: README images, favicons, emails. */
export const BRAND_PALETTE_LIGHT: BrandPalette = {
  ink: '#16152b',
  free: '#00a63e',
  pro: '#7844e3',
  gradientFrom: '#6925d5',
  gradientTo: '#ddcfff',
  tile: '#16152b',
  tileInk: '#faf9fd',
}

export const BRAND_PALETTE_DARK: BrandPalette = {
  ...BRAND_PALETTE_LIGHT,
  ink: '#f4f3fa',
  free: '#05df72',
  pro: '#9c81f7',
}

/**
 * Paints for inline SVG in a themed page. Ink follows the text colour; the
 * dots read CSS variables so each app can theme them, with static fallbacks.
 */
export const BRAND_CSS_PAINTS: Record<BrandPaint, string> = {
  'ink': 'currentColor',
  'free': `var(--nuxtseo-brand-free, ${BRAND_PALETTE_LIGHT.free})`,
  'pro': `var(--nuxtseo-brand-pro, ${BRAND_PALETTE_LIGHT.pro})`,
  'pro-gradient': '',
  'tile': `var(--nuxtseo-brand-tile, ${BRAND_PALETTE_LIGHT.tile})`,
  'tile-ink': `var(--nuxtseo-brand-tile-ink, ${BRAND_PALETTE_LIGHT.tileInk})`,
}

export function paletteToPaints(palette: BrandPalette): Record<BrandPaint, string> {
  return {
    'ink': palette.ink,
    'free': palette.free,
    'pro': palette.pro,
    'pro-gradient': '',
    'tile': palette.tile,
    'tile-ink': palette.tileInk,
  }
}

// ---------------------------------------------------------------------------
// Module icons: a 32 grid, one even pen, one landing dot each.

interface IconStroke {
  d: string
  /** Multiplier on the pen width. */
  weight?: number
  /** Drawn as a dotted route. Small cuts draw it solid. */
  dotted?: boolean
}

interface IconSpec {
  label: string
  strokes: IconStroke[]
  landing: { cx: number, cy: number, r: number, shape: 'dot' | 'spark' }
  /** Degrees around the grid centre. */
  rotate?: number
}

export const BRAND_ICONS: Record<BrandIconName, IconSpec> = {
  'site-config': {
    label: 'Site Config',
    strokes: [
      { d: 'M5.4 9.4 Q16 8 26.6 8.8 Q27.4 16.8 26.8 25 Q16 26 5.8 25.2 Q4.8 17.4 5.6 8.4' },
      { d: 'M5.5 13.6 Q16.2 12.6 26.9 13.4', weight: 0.8 },
      { d: 'M13.6 8.8 Q13.4 5 16 4.9 Q18.6 5 18.4 8.8' },
      { d: 'M9 20.6 Q10.2 16.6 11.5 19.4 Q12.6 21.8 13.8 18.8 Q15 16.2 16 19 Q16.9 21.2 18.4 19 Q19.2 18 20.4 18.6' },
    ],
    landing: { cx: 23.2, cy: 19.2, r: 1.7, shape: 'dot' },
  },
  'robots': {
    label: 'Robots',
    strokes: [
      { d: 'M8.8 11.2 Q16 10.4 23.4 11 Q25.6 11.2 25.6 13.4 Q26 19 25.4 23.8 Q25.2 25.8 23 25.9 Q16 26.6 9.2 25.9 Q7 25.7 6.9 23.6 Q6.5 18.2 7 13.4 Q7.1 11.4 9.4 11.1' },
      { d: 'M16.2 10.8 Q15.8 8.6 16.1 7.2' },
      { d: 'M12.4 16.4 L12.4 18', weight: 1.3 },
      { d: 'M19.6 16.4 L19.6 18', weight: 1.3 },
      { d: 'M12.6 21.4 Q16 23.4 19.6 21.2' },
      { d: 'M4.4 16.4 Q4.2 18.2 4.5 20' },
      { d: 'M27.6 16.2 Q27.9 18 27.6 19.8' },
    ],
    landing: { cx: 16.1, cy: 5.2, r: 1.9, shape: 'dot' },
  },
  'sitemap': {
    label: 'Sitemap',
    strokes: [
      { d: 'M4.6 8.8 L11.2 6.2 L20.6 8.6 L27.4 6.2 Q27.8 14.6 27.6 23 L20.8 25.6 L11 23 L4.4 25.4 Q4.1 17 4.7 8.2' },
      { d: 'M11.2 6.2 Q11.5 14.6 11 23', weight: 0.7 },
      { d: 'M20.6 8.6 Q20.4 17 20.8 25.6', weight: 0.7 },
      { d: 'M7.4 20.6 Q9.2 15.6 13.2 16.4 Q17.4 17.4 17.2 13.6 Q17.2 11.2 21.4 11.8', dotted: true },
    ],
    landing: { cx: 23.8, cy: 12.4, r: 1.9, shape: 'dot' },
  },
  'og-image': {
    label: 'OG Image',
    strokes: [
      { d: 'M7 5 Q16 4.4 25.4 5.2 Q26.2 15.6 25.6 27 Q16 27.6 6.4 26.8 Q5.8 16 7.2 4.4' },
      { d: 'M9.6 8 Q16 7.6 22.8 8 Q23.2 13.6 22.8 19.6 Q16 20 9.4 19.6 Q9 13.8 9.6 8', weight: 0.8 },
      { d: 'M9.8 17.4 Q12.6 14 15.2 16 Q18.2 18.2 22.6 14.8' },
      { d: 'M11.2 23.4 Q14 22.8 17.4 23.4', weight: 0.8 },
    ],
    landing: { cx: 18.6, cy: 11.4, r: 1.8, shape: 'dot' },
  },
  'schema-org': {
    label: 'Schema.org',
    strokes: [
      { d: 'M10.2 5.4 Q7.4 5.6 7.8 9.4 Q8 13.6 5.4 15.9 Q8 18.2 7.8 22.4 Q7.6 26.4 10.4 26.6' },
      { d: 'M21.8 5.4 Q24.6 5.6 24.2 9.4 Q24 13.6 26.6 15.9 Q24 18.2 24.2 22.4 Q24.4 26.4 21.6 26.6' },
      { d: 'M13.8 12 L18 13.2', weight: 0.8 },
      { d: 'M18.4 15.6 L15.6 19.2', weight: 0.8 },
      { d: 'M12.6 13.2 Q12.9 16.4 13.6 19.4', weight: 0.8 },
      { d: 'M12.3 10 Q13.8 10.1 13.8 11.5 Q13.7 12.9 12.3 12.9 Q10.9 12.8 10.9 11.4 Q11 10.2 12.6 10.1' },
      { d: 'M14.5 19.4 Q16 19.5 16 20.9 Q15.9 22.3 14.5 22.3 Q13.1 22.2 13.1 20.8 Q13.2 19.6 14.8 19.5' },
    ],
    landing: { cx: 19.8, cy: 13.8, r: 1.9, shape: 'dot' },
  },
  'seo-utils': {
    label: 'SEO Utils',
    rotate: -32,
    strokes: [
      { d: 'M10 10.4 Q18.6 9.8 27 10.2 Q27.6 16 27.2 21.8 Q18.6 22.4 10.2 21.8 L4.4 16.2 Q7.2 13.2 10.4 10' },
      { d: 'M14.8 14.2 Q19 13.9 23.4 14.2', weight: 0.8 },
      { d: 'M14.8 17.8 Q17.4 17.6 20.2 17.8', weight: 0.8 },
      { d: 'M8.8 16 Q4.6 16.4 2.6 13.4 Q1.4 11.2 3.2 10', weight: 0.85 },
    ],
    landing: { cx: 10.2, cy: 16, r: 1.7, shape: 'dot' },
  },
  'link-checker': {
    label: 'Link Checker',
    strokes: [
      { d: 'M13.6 18.4 L10.8 21.2 Q8 24 5.2 21.2 Q2.4 18.4 5.2 15.6 L8.8 12 Q11.6 9.2 14.4 12 Q15.2 12.8 15.1 13.8' },
      { d: 'M18.4 13.6 L21.2 10.8 Q24 8 26.8 10.8 Q29.6 13.6 26.8 16.4 L23.2 20 Q20.4 22.8 17.6 20 Q16.8 19.2 16.9 18.2' },
    ],
    landing: { cx: 16, cy: 16, r: 1.9, shape: 'dot' },
  },
  'skew-protection': {
    label: 'Skew Protection',
    strokes: [
      { d: 'M11.6 5 Q18.8 5.6 26 7 Q25 15.4 23.2 23.8 L21.4 23.6', weight: 0.8 },
      { d: 'M6.4 8.6 Q13.4 8 20.6 8.6 Q21 17.6 20.6 26.8 Q13.4 27.2 6 26.8 Q5.6 17.6 6.5 7.9' },
      { d: 'M10.2 13.4 L10.2 5.8 Q10.2 3.6 12.2 3.6 Q14.2 3.6 14.2 5.8 L14.2 12.6 Q14.2 14.4 12.5 14.4 Q11.4 14.4 11.5 12.8 L11.6 8' },
      { d: 'M9 18.6 Q13 18.2 17.4 18.5', weight: 0.8 },
      { d: 'M9 22 Q11.4 21.8 13.4 22', weight: 0.8 },
    ],
    landing: { cx: 16.8, cy: 22, r: 1.7, shape: 'dot' },
  },
  'ai-ready': {
    label: 'AI Ready',
    strokes: [
      { d: 'M16 10 Q11 7.4 4.6 8.4 Q4.4 16.4 4.8 24.4 Q11 23.2 16 25.8' },
      { d: 'M16 10 Q21 7.4 27.4 8.4 Q27.6 16.4 27.2 24.4 Q21 23.2 16 25.8' },
      { d: 'M16 10 Q16.3 18 16 25.8', weight: 0.8 },
      { d: 'M7.4 12.8 Q10.4 12.2 13.2 13.4', weight: 0.8 },
      { d: 'M7.4 16.4 Q10.4 15.8 13.2 17', weight: 0.8 },
      { d: 'M7.4 20 Q9.4 19.6 11.2 20.2', weight: 0.8 },
    ],
    landing: { cx: 21.8, cy: 16.4, r: 4.2, shape: 'spark' },
  },
  'mcp': {
    label: 'MCP Server',
    strokes: [
      { d: 'M11.6 4.2 L11.4 9' },
      { d: 'M20.4 4.2 L20.6 9' },
      { d: 'M7.4 9 Q16 8.4 24.6 9.1 Q24.8 16.2 19.8 19.2 Q16 21 12.2 19.2 Q7.2 16.2 7.5 8.4' },
      { d: 'M16 20.6 Q15.8 25.2 19.2 26.6 Q21.6 27.4 23.6 26.6' },
    ],
    landing: { cx: 25.8, cy: 26, r: 1.7, shape: 'dot' },
  },
}

/** How an icon adapts to its rendered size: heavier pen and bigger dot as it shrinks. */
type IconCut = 'regular' | 'compact' | 'small'

function iconCut(size: number): IconCut {
  if (size <= 18)
    return 'small'
  if (size <= 28)
    return 'compact'
  return 'regular'
}

const PEN_WIDTH: Record<IconCut, number> = { regular: 1.75, compact: 2, small: 2.3 }
const DOT_SCALE: Record<IconCut, number> = { regular: 1, compact: 1.45, small: 1.6 }
const SPARK_SCALE: Record<IconCut, number> = { regular: 1, compact: 1.12, small: 1.12 }

function sparkPath(cx: number, cy: number, r: number): string {
  const q = r * 0.16
  return `M${cx} ${cy - r} Q${cx + q} ${cy - q} ${cx + r} ${cy} Q${cx + q} ${cy + q} ${cx} ${cy + r} Q${cx - q} ${cy + q} ${cx - r} ${cy} Q${cx - q} ${cy - q} ${cx} ${cy - r}Z`
}

function landingPaint(landing: BrandLanding): BrandPaint | undefined {
  return landing === 'none' ? undefined : landing
}

export interface IconOptions {
  /** Colour of the landing dot. Defaults to `free`. */
  landing?: BrandLanding
  /** Rendered size in CSS pixels. Picks the cut: smaller icons get a heavier pen. */
  size?: number
}

export function iconDrawing(name: BrandIconName, { landing = 'free', size = 32 }: IconOptions = {}): BrandDrawing {
  const spec = BRAND_ICONS[name]
  const cut = iconCut(size)
  const pen = PEN_WIDTH[cut]
  const shapes: BrandShape[] = spec.strokes.map((stroke) => {
    const width = pen * (stroke.weight ?? 1)
    const dash = stroke.dotted && cut !== 'small' ? `0.01 ${(width * 1.9).toFixed(2)}` : undefined
    return { _tag: 'Line', d: stroke.d, width, paint: 'ink', dash }
  })
  const paint = landingPaint(landing)
  if (paint) {
    const { cx, cy, r, shape } = spec.landing
    shapes.push(shape === 'spark'
      ? { _tag: 'Area', d: sparkPath(cx, cy, r * SPARK_SCALE[cut]), paint }
      : { _tag: 'Dot', cx, cy, r: r * DOT_SCALE[cut], paint })
  }
  return {
    viewBox: '0 0 32 32',
    label: spec.label,
    groups: [{ transform: spec.rotate ? `rotate(${spec.rotate} 16 16)` : undefined, shapes }],
  }
}

// ---------------------------------------------------------------------------
// The summit mark: the pen climbs a foothill, then the Nuxt peak, and lands on the apex.

interface SummitCut {
  pen: number
  climb: string
  flank: string
  /** Pro lockups pull both flanks back so the ring keeps clear air. */
  climbRinged: string
  flankRinged: string
  dot: { cx: number, cy: number, r: number }
  ring: { r: number, width: number, dotR: number }
}

const SUMMIT_REGULAR: SummitCut = {
  pen: 5.4,
  climb: 'M5 54 L18.4 37.4 Q21 34.4 23.6 37.4 L27.6 42.4 L39.4 19.6',
  flank: 'M48.4 19.6 L60 54',
  climbRinged: 'M5 54 L18.4 37.4 Q21 34.4 23.6 37.4 L27.6 42.4 L37.4 23.4',
  flankRinged: 'M50 23.6 L60 54',
  dot: { cx: 44, cy: 11.6, r: 6.2 },
  ring: { r: 8.2, width: 2, dotR: 4.6 },
}

/** The 16px cut: fewer bends, a heavier line, a bigger dot. */
const SUMMIT_SMALL: SummitCut = {
  pen: 8,
  climb: 'M6 54 L20 36 L27 43 L38 21',
  flank: 'M47 21 L59 54',
  climbRinged: 'M6 54 L20 36 L27 43 L35.2 26.6',
  flankRinged: 'M49.6 27 L59 54',
  dot: { cx: 44, cy: 12.5, r: 8.4 },
  ring: { r: 9, width: 3, dotR: 5.2 },
}

/** The far flank sits in shadow behind the climb. */
const FLANK_OPACITY = 0.38

export interface MarkOptions {
  product?: BrandProduct
  /** Rendered size in CSS pixels. 18 and below uses the small cut. */
  size?: number
}

function summitShapes(cut: SummitCut, product: BrandProduct, ink: BrandPaint, style: 'lockup' | 'favicon'): BrandShape[] {
  // Pro lockups ring the dot. Pro favicons keep the plain dot and carry the original gradient instead.
  if (product === 'pro' && style === 'lockup') {
    const { cx, cy } = cut.dot
    return [
      { _tag: 'Line', d: cut.flankRinged, width: cut.pen, paint: ink, opacity: FLANK_OPACITY },
      { _tag: 'Line', d: cut.climbRinged, width: cut.pen, paint: ink },
      { _tag: 'Ring', cx, cy, r: cut.ring.r, width: cut.ring.width, paint: ink },
      { _tag: 'Dot', cx, cy, r: cut.ring.dotR, paint: 'pro' },
    ]
  }
  const gradient = product === 'pro'
  return [
    { _tag: 'Line', d: cut.flank, width: cut.pen, paint: ink, opacity: FLANK_OPACITY },
    { _tag: 'Line', d: cut.climb, width: cut.pen, paint: gradient ? 'pro-gradient' : ink },
    { _tag: 'Dot', ...cut.dot, paint: gradient ? 'pro-gradient' : 'free' },
  ]
}

export function markDrawing({ product = 'free', size = 64 }: MarkOptions = {}): BrandDrawing {
  const cut = size <= 18 ? SUMMIT_SMALL : SUMMIT_REGULAR
  return {
    viewBox: '0 0 64 64',
    label: product === 'pro' ? 'Nuxt SEO Pro' : 'Nuxt SEO',
    groups: [{ shapes: summitShapes(cut, product, 'ink', 'lockup') }],
  }
}

export interface FaviconOptions {
  product?: BrandProduct
  /** Pixel size of the favicon. 16 and below uses the small cut. */
  size?: number
}

/** The summit on a dark tile. Free stays flat; Pro keeps the original violet gradient on the climb. */
export function faviconDrawing({ product = 'free', size = 32 }: FaviconOptions = {}): BrandDrawing {
  const small = size <= 18
  const cut = small ? SUMMIT_SMALL : SUMMIT_REGULAR
  const pad = small ? 3 : 6
  const scale = (64 - pad * 2) / 64
  return {
    viewBox: '0 0 64 64',
    label: product === 'pro' ? 'Nuxt SEO Pro' : 'Nuxt SEO',
    groups: [
      { shapes: [{ _tag: 'Tile', size: 64, radius: small ? 12 : 14, paint: 'tile' }] },
      { transform: `translate(${pad} ${pad}) scale(${scale})`, shapes: summitShapes(cut, product, 'tile-ink', 'favicon') },
    ],
  }
}

/** The icon fills this share of its plate. */
const PLATE_ICON_SHARE = 44 / 64

export interface IconPlateOptions {
  landing?: BrandLanding
  /** Rendered size of the plate in pixels; the icon inside picks its cut from its own size. */
  size?: number
}

/**
 * A module icon on the dark favicon plate. It reads on light and dark grounds
 * alike, so one image serves places that cannot swap by theme, such as READMEs.
 */
export function iconPlateDrawing(name: BrandIconName, { landing = 'free', size = 64 }: IconPlateOptions = {}): BrandDrawing {
  const icon = iconDrawing(name, { landing, size: size * PLATE_ICON_SHARE })
  const inset = 64 * (1 - PLATE_ICON_SHARE) / 2
  const scale = 64 * PLATE_ICON_SHARE / 32
  return {
    viewBox: '0 0 64 64',
    label: icon.label,
    groups: [
      { shapes: [{ _tag: 'Tile', size: 64, radius: 14, paint: 'tile' }] },
      ...icon.groups.map(group => ({
        transform: [`translate(${inset} ${inset}) scale(${scale})`, group.transform].filter(Boolean).join(' '),
        shapes: group.shapes.map((shape): BrandShape => 'paint' in shape && shape.paint === 'ink' ? { ...shape, paint: 'tile-ink' } : shape),
      })),
    ],
  }
}

// ---------------------------------------------------------------------------
// "Pro", lettered with a heavier icon pen and underlined with one quick swipe.

const PRO_LETTERS = [
  'M5.2 27.6 Q4.8 16.4 5.4 5.2',
  'M4.6 5.6 Q13.4 3.8 14.4 9.8 Q15 15.8 5.2 16.2',
  'M20.4 27.6 Q20.2 20.6 20.4 13.2',
  'M20.4 18 Q22.2 13 27.2 13.6',
  'M36.2 13.4 Q30.6 13.6 30.8 20.6 Q31 27.8 36.6 27.6 Q42 27.4 41.8 20.4 Q41.6 13.4 35.4 13.9',
]

const PRO_PEN = 3.4

type Point = readonly [number, number]

/** Outline of a quadratic stroke whose width follows `width(t)`, with round caps. */
function taperedQuadratic(p0: Point, p1: Point, p2: Point, width: (t: number) => number, steps = 40): string {
  const at = (t: number): Point => {
    const u = 1 - t
    return [u * u * p0[0] + 2 * t * u * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * t * u * p1[1] + t * t * p2[1]]
  }
  const tangent = (t: number): Point => {
    const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0])
    const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1])
    const length = Math.hypot(dx, dy) || 1
    return [dx / length, dy / length]
  }
  const left: Point[] = []
  const right: Point[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const [x, y] = at(t)
    const [dx, dy] = tangent(t)
    const half = width(t) / 2
    left.push([x - dy * half, y + dx * half])
    right.push([x + dy * half, y - dx * half])
  }
  const f = (v: number) => v.toFixed(2)
  const end = right[right.length - 1]!
  const rEnd = width(1) / 2
  const rStart = width(0) / 2
  return [
    `M${f(left[0]![0])} ${f(left[0]![1])}`,
    ...left.slice(1).map(([x, y]) => `L${f(x)} ${f(y)}`),
    `A${f(rEnd)} ${f(rEnd)} 0 0 0 ${f(end[0])} ${f(end[1])}`,
    ...right.slice(0, -1).reverse().map(([x, y]) => `L${f(x)} ${f(y)}`),
    `A${f(rStart)} ${f(rStart)} 0 0 0 ${f(left[0]![0])} ${f(left[0]![1])}Z`,
  ].join(' ')
}

/** Firm where the pen lands, lifting off to the right. */
const PRO_UNDERLINE = taperedQuadratic([-0.6, 36.2], [20, 33.2], [46.4, 32.8], t => 3.8 - 2.6 * t ** 1.3)

/** Width over height of the lettering's view box, for laying it out beside the wordmark. */
export const PRO_LETTERING_ASPECT = 52 / 39

/** Set the lettering about 1.55 times the wordmark's font size. */
export const PRO_LETTERING_SCALE = 1.55

export function proLetteringDrawing(): BrandDrawing {
  return {
    viewBox: '-3 1 52 39',
    label: 'Pro',
    groups: [{
      transform: 'rotate(-3 23 20)',
      shapes: [
        ...PRO_LETTERS.map((d): BrandShape => ({ _tag: 'Line', d, width: PRO_PEN, paint: 'pro' })),
        { _tag: 'Area', d: PRO_UNDERLINE, paint: 'pro' },
      ],
    }],
  }
}

// ---------------------------------------------------------------------------
// Rendering

export interface SvgOptions {
  /** CSS value per paint. Use `BRAND_CSS_PAINTS` inline in a themed page, `paletteToPaints()` for static files. */
  paints?: Record<BrandPaint, string>
  /** Gradient colours for `pro-gradient`. */
  gradient?: { from: string, to: string }
  /** Prefix for the gradient id. Pass a unique value when several marks share one page. */
  idPrefix?: string
  width?: number | string
  height?: number | string
  /** Extra attributes for the root element, already escaped. */
  attrs?: string
}

const escapeAttr = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export function drawingToSvg(drawing: BrandDrawing, options: SvgOptions = {}): string {
  const paints = options.paints ?? BRAND_CSS_PAINTS
  const gradientId = `${options.idPrefix ?? 'nuxtseo'}-pro-gradient`
  const gradient = options.gradient ?? { from: BRAND_PALETTE_LIGHT.gradientFrom, to: BRAND_PALETTE_LIGHT.gradientTo }
  let usesGradient = false
  const paint = (p: BrandPaint) => {
    if (p !== 'pro-gradient')
      return paints[p]
    usesGradient = true
    return `url(#${gradientId})`
  }
  const shape = (s: BrandShape): string => {
    switch (s._tag) {
      case 'Line':
        return `<path d="${s.d}" fill="none" stroke="${paint(s.paint)}" stroke-width="${+s.width.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${s.dash ? ` stroke-dasharray="${s.dash}"` : ''}${s.opacity === undefined ? '' : ` opacity="${s.opacity}"`}/>`
      case 'Area':
        return `<path d="${s.d}" fill="${paint(s.paint)}"/>`
      case 'Dot':
        return `<circle cx="${s.cx}" cy="${s.cy}" r="${+s.r.toFixed(2)}" fill="${paint(s.paint)}"/>`
      case 'Ring':
        return `<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="none" stroke="${paint(s.paint)}" stroke-width="${s.width}"/>`
      case 'Tile':
        return `<rect width="${s.size}" height="${s.size}" rx="${s.radius}" fill="${paint(s.paint)}"/>`
    }
  }
  const body = drawing.groups.map((group) => {
    const inner = group.shapes.map(shape).join('')
    return group.transform ? `<g transform="${group.transform}">${inner}</g>` : inner
  }).join('')
  const defs = usesGradient
    ? `<defs><linearGradient id="${gradientId}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${gradient.from}"/><stop offset="1" stop-color="${gradient.to}"/></linearGradient></defs>`
    : ''
  const size = [
    options.width === undefined ? '' : ` width="${options.width}"`,
    options.height === undefined ? '' : ` height="${options.height}"`,
  ].join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${drawing.viewBox}"${size} role="img" aria-label="${escapeAttr(drawing.label)}"${options.attrs ? ` ${options.attrs}` : ''}>${defs}${body}</svg>`
}

export function isBrandIconName(value: string): value is BrandIconName {
  return Object.hasOwn(BRAND_ICONS, value)
}

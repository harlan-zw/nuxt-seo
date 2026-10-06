import type { BrandDrawing, BrandShape } from '../../src/brand'
import { describe, expect, it } from 'vitest'
import { BRAND_PALETTE_DARK, BRAND_PALETTE_LIGHT, drawingToSvg, faviconDrawing, iconDrawing, iconPlateDrawing, isBrandIconName, markDrawing } from '../../src/brand'

const shapes = (drawing: BrandDrawing): BrandShape[] => drawing.groups.flatMap(group => group.shapes)

describe('iconDrawing', () => {
  it('draws the sitemap route dotted at full size and solid at 16px', () => {
    const dashes = (size: number) => shapes(iconDrawing('sitemap', { size })).filter(shape => shape._tag === 'Line' && shape.dash)
    expect(dashes(44)).toHaveLength(1)
    expect(dashes(16)).toHaveLength(0)
  })

  it('grows the landing dot as the icon shrinks', () => {
    const dotRadius = (size: number) => shapes(iconDrawing('robots', { size })).find(shape => shape._tag === 'Dot')
    expect((dotRadius(22) as { r: number }).r).toBeGreaterThan((dotRadius(44) as { r: number }).r)
  })

  it('paints the landing in the requested tone', () => {
    const landing = shapes(iconDrawing('robots', { landing: 'pro' })).find(shape => shape._tag === 'Dot')
    expect(landing).toMatchObject({ paint: 'pro' })
  })

  it('draws no landing when asked for none', () => {
    const landings = shapes(iconDrawing('ai-ready', { landing: 'none' })).filter(shape => shape._tag !== 'Line')
    expect(landings).toEqual([])
  })
})

describe('iconPlateDrawing', () => {
  it('draws the icon in plate ink so it reads on the dark plate', () => {
    const paints = shapes(iconPlateDrawing('robots')).map(shape => 'paint' in shape ? shape.paint : undefined)
    expect(paints).toContain('tile')
    expect(paints).toContain('tile-ink')
    expect(paints).not.toContain('ink')
  })

  it('keeps the icon rotation inside the plate', () => {
    const transforms = iconPlateDrawing('seo-utils').groups.map(group => group.transform ?? '')
    expect(transforms.some(transform => transform.includes('rotate(-32 16 16)'))).toBe(true)
  })
})

describe('summit marks', () => {
  it('draws the Pro climb in the gradient and lands it on a solid violet dot', () => {
    const pro = shapes(markDrawing({ product: 'pro' }))
    expect(pro.some(shape => shape._tag === 'Line' && shape.paint === 'pro-gradient')).toBe(true)
    expect(pro.find(shape => shape._tag === 'Dot')).toMatchObject({ paint: 'pro' })
  })

  it('keeps the free mark in ink with a green dot', () => {
    const free = shapes(markDrawing({ product: 'free' }))
    expect(free.map(shape => 'paint' in shape && shape.paint)).not.toContain('pro-gradient')
    expect(free.find(shape => shape._tag === 'Dot')).toMatchObject({ paint: 'free' })
  })

  it('draws the Pro favicon in the plate gradient, which ignores the page theme', () => {
    const paints = shapes(faviconDrawing({ product: 'pro', size: 16 })).map(shape => 'paint' in shape && shape.paint)
    expect(paints).toContain('tile-gradient')
    expect(paints).not.toContain('pro-gradient')
  })
})

describe('drawingToSvg', () => {
  const stops = (svg: string) => [...svg.matchAll(/stop-color:([^"]+)"/g)].map(match => match[1])

  it('points gradient fills at a definition with the given id prefix', () => {
    const svg = drawingToSvg(faviconDrawing({ product: 'pro' }), { idPrefix: 'tab-a' })
    const used = [...svg.matchAll(/url\(#([^)]+)\)/g)].map(match => match[1])
    expect(new Set(used)).toEqual(new Set(['tab-a-tile-gradient']))
    expect(svg).toContain('<linearGradient id="tab-a-tile-gradient"')
  })

  it('themes the Pro mark gradient through CSS variables by default', () => {
    expect(stops(drawingToSvg(markDrawing({ product: 'pro' })))).toEqual([
      'var(--nuxtseo-brand-gradient-from, #5b21b6)',
      'var(--nuxtseo-brand-gradient-to, #a68af7)',
    ])
  })

  it('writes the palette gradient as static stops', () => {
    expect(stops(drawingToSvg(markDrawing({ product: 'pro' }), { palette: BRAND_PALETTE_DARK }))).toEqual(['#6925d5', '#ddcfff'])
    expect(stops(drawingToSvg(markDrawing({ product: 'pro' }), { palette: BRAND_PALETTE_LIGHT }))).toEqual(['#5b21b6', '#a68af7'])
  })

  it('keeps the plate gradient when the palette is light', () => {
    expect(stops(drawingToSvg(faviconDrawing({ product: 'pro' }), { palette: BRAND_PALETTE_LIGHT }))).toEqual(['#6925d5', '#ddcfff'])
  })

  it('omits gradient definitions when nothing uses them', () => {
    expect(drawingToSvg(faviconDrawing({ product: 'free' }))).not.toContain('<defs>')
  })
})

describe('isBrandIconName', () => {
  it.each([
    ['robots', true],
    ['mcp', true],
    ['nuxt-seo', false],
    ['toString', false],
    ['__proto__', false],
  ])('%s → %s', (value, expected) => {
    expect(isBrandIconName(value)).toBe(expected)
  })
})

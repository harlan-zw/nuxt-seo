import type { BrandDrawing, BrandShape } from '../../src/brand'
import { describe, expect, it } from 'vitest'
import { drawingToSvg, faviconDrawing, iconDrawing, isBrandIconName, markDrawing } from '../../src/brand'

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

describe('summit marks', () => {
  it('rings the Pro lockup dot', () => {
    expect(shapes(markDrawing({ product: 'pro' })).some(shape => shape._tag === 'Ring')).toBe(true)
    expect(shapes(markDrawing({ product: 'free' })).some(shape => shape._tag === 'Ring')).toBe(false)
  })

  it('carries the Pro favicon difference in the gradient, not a ring', () => {
    const pro = shapes(faviconDrawing({ product: 'pro', size: 16 }))
    expect(pro.some(shape => shape._tag === 'Ring')).toBe(false)
    expect(pro.some(shape => 'paint' in shape && shape.paint === 'pro-gradient')).toBe(true)
  })
})

describe('drawingToSvg', () => {
  it('points gradient fills at a definition with the given id prefix', () => {
    const svg = drawingToSvg(faviconDrawing({ product: 'pro' }), { idPrefix: 'tab-a' })
    const used = [...svg.matchAll(/url\(#([^)]+)\)/g)].map(match => match[1])
    expect(new Set(used)).toEqual(new Set(['tab-a-pro-gradient']))
    expect(svg).toContain('<linearGradient id="tab-a-pro-gradient"')
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

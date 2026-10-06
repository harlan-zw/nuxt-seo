// Writes static brand SVGs for README headers: a light and a dark cut of one mark or module icon.
// Usage: node --experimental-strip-types scripts/brand-assets.ts <out-dir> <mark|icon-name> [file-stem]
import type { BrandDrawing, BrandIconName } from '../packages/shared/src/brand.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { BRAND_ICONS, BRAND_PALETTE_DARK, BRAND_PALETTE_LIGHT, drawingToSvg, iconDrawing, markDrawing, paletteToPaints } from '../packages/shared/src/brand.ts'

type Target
  = | { _tag: 'Mark' }
    | { _tag: 'Icon', name: BrandIconName }

function parseTarget(value: string | undefined): Target | undefined {
  if (value === 'mark')
    return { _tag: 'Mark' }
  if (value && value in BRAND_ICONS)
    return { _tag: 'Icon', name: value as BrandIconName }
  return undefined
}

const [outDir, rawTarget, stem = 'logo'] = process.argv.slice(2)
const target = parseTarget(rawTarget)
if (!outDir || !target) {
  console.error(`Usage: brand-assets.ts <out-dir> <mark|${Object.keys(BRAND_ICONS).join('|')}> [file-stem]`)
  process.exit(2)
}

const drawing: BrandDrawing = target._tag === 'Mark'
  ? markDrawing({ size: 96 })
  : iconDrawing(target.name, { size: 96 })

mkdirSync(outDir, { recursive: true })
for (const [theme, palette] of [['light', BRAND_PALETTE_LIGHT], ['dark', BRAND_PALETTE_DARK]] as const) {
  const file = join(outDir, `${stem}-${theme}.svg`)
  writeFileSync(file, `${drawingToSvg(drawing, { paints: paletteToPaints(palette), width: 96, height: 96 })}\n`)
  console.log(file)
}

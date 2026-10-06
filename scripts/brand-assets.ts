// Writes a README header image: the summit or a module icon on the dark favicon plate.
// One plate reads on GitHub's light and dark themes, so the README needs no theme swap.
// Usage: node --experimental-strip-types scripts/brand-assets.ts <out-dir> <mark|icon-name> [file-stem]
import type { BrandDrawing, BrandIconName } from '../packages/shared/src/brand.ts'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { BRAND_ICONS, BRAND_PALETTE_DARK, drawingToSvg, faviconDrawing, iconPlateDrawing, paletteToPaints } from '../packages/shared/src/brand.ts'

/** READMEs show the plate at this size inside the H1. */
const README_SIZE = 40

type Target
  = | { _tag: 'Mark' }
    | { _tag: 'Icon', name: BrandIconName }

function parseTarget(value: string | undefined): Target | undefined {
  if (value === 'mark')
    return { _tag: 'Mark' }
  if (value && Object.hasOwn(BRAND_ICONS, value))
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
  ? faviconDrawing({ size: README_SIZE })
  : iconPlateDrawing(target.name, { size: README_SIZE })

mkdirSync(outDir, { recursive: true })
const file = join(outDir, `${stem}.svg`)
writeFileSync(file, `${drawingToSvg(drawing, { paints: paletteToPaints(BRAND_PALETTE_DARK), width: 64, height: 64 })}\n`)
console.log(file)

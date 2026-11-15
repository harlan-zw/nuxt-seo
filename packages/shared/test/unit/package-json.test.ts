import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import * as nodeModule from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { findPackageJSON, findPackageJSONFallback } from '../../src/package-json'

function writeJSON(path: string, value: unknown) {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, JSON.stringify(value))
}

function writeFile(path: string, content = '') {
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, content)
}

let root: string
let app: string

beforeAll(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'nuxtseo-find-package-json-')))
  app = join(root, 'app')
  writeJSON(join(app, 'package.json'), { name: 'app', version: '1.0.0' })
  writeFile(join(app, 'src', 'nested', 'entry.mjs'))
  const modules = join(app, 'node_modules')

  // Classic package with `main`.
  writeJSON(join(modules, 'plain', 'package.json'), { name: 'plain', version: '1.0.0', main: './lib/index.js' })
  writeFile(join(modules, 'plain', 'lib', 'index.js'))

  // Scoped package with `exports` that does not expose `./package.json`, and a nested `dist/package.json`.
  const scoped = join(modules, '@scope', 'exports-only')
  writeJSON(join(scoped, 'package.json'), { name: '@scope/exports-only', version: '2.0.0', exports: { '.': { import: './dist/index.mjs', default: './dist/index.cjs' }, './sub': './dist/sub.mjs' } })
  writeJSON(join(scoped, 'dist', 'package.json'), { type: 'module' })
  writeFile(join(scoped, 'dist', 'index.mjs'))
  writeFile(join(scoped, 'dist', 'index.cjs'))
  writeFile(join(scoped, 'dist', 'sub.mjs'))

  // ESM-only package: `require.resolve` cannot resolve it (no `require`/`default` condition).
  const esmOnly = join(modules, 'esm-only')
  writeJSON(join(esmOnly, 'package.json'), { name: 'esm-only', version: '3.0.0', type: 'module', exports: { '.': { import: './index.js' } } })
  writeFile(join(esmOnly, 'index.js'))

  // pnpm-style symlinked package.
  const store = join(root, 'store', 'linked')
  writeJSON(join(store, 'package.json'), { name: 'linked', version: '4.0.0', main: 'index.js' })
  writeFile(join(store, 'index.js'))
  symlinkSync(store, join(modules, 'linked'), 'dir')

  // Hoisted to a parent `node_modules`.
  writeJSON(join(root, 'node_modules', 'hoisted', 'package.json'), { name: 'hoisted', version: '5.0.0', main: 'index.js' })
  writeFile(join(root, 'node_modules', 'hoisted', 'index.js'))
})

afterAll(() => {
  rmSync(root, { recursive: true, force: true })
})

function normalize(path: string | undefined) {
  return path && realpathSync(path)
}

const hasNative = typeof (nodeModule as { findPackageJSON?: unknown }).findPackageJSON === 'function'

const implementations = [
  ['fallback', findPackageJSONFallback],
  ['findPackageJSON', findPackageJSON],
  ...(hasNative
    ? [['native node:module', (nodeModule as unknown as { findPackageJSON: typeof findPackageJSON }).findPackageJSON] as const]
    : []),
] as const

describe.each(implementations)('%s', (_name, find) => {
  const base = () => pathToFileURL(join(app, 'package.json'))

  it('resolves a bare specifier to the package root package.json', () => {
    expect(normalize(find('plain', base()))).toBe(join(app, 'node_modules', 'plain', 'package.json'))
  })

  it('resolves a scoped package with exports that do not expose ./package.json', () => {
    const expected = join(app, 'node_modules', '@scope', 'exports-only', 'package.json')
    expect(normalize(find('@scope/exports-only', base()))).toBe(expected)
    expect(normalize(find('@scope/exports-only/sub', base()))).toBe(expected)
  })

  it('resolves an ESM-only package', () => {
    expect(normalize(find('esm-only', base()))).toBe(join(app, 'node_modules', 'esm-only', 'package.json'))
  })

  it('resolves symlinked and hoisted packages', () => {
    expect(normalize(find('linked', base()))).toBe(join(root, 'store', 'linked', 'package.json'))
    expect(normalize(find('hoisted', base()))).toBe(join(root, 'node_modules', 'hoisted', 'package.json'))
  })

  it('accepts a path base and a string file URL base', () => {
    expect(normalize(find('plain', join(app, 'src', 'nested', 'entry.mjs')))).toBe(join(app, 'node_modules', 'plain', 'package.json'))
    expect(normalize(find('plain', base().href))).toBe(join(app, 'node_modules', 'plain', 'package.json'))
  })

  it('resolves relative specifiers to the nearest parent package.json', () => {
    const entry = pathToFileURL(join(app, 'src', 'nested', 'entry.mjs'))
    expect(find('./', entry)).toBe(join(app, 'package.json'))
    expect(find('./entry.mjs', entry)).toBe(join(app, 'package.json'))
    expect(find('../..', entry)).toBe(join(app, 'package.json'))
    expect(find('./dist/index.mjs', pathToFileURL(join(app, 'node_modules', '@scope', 'exports-only', 'package.json'))))
      .toBe(join(app, 'node_modules', '@scope', 'exports-only', 'dist', 'package.json'))
  })

  it('resolves file URL and absolute path specifiers', () => {
    const entry = join(app, 'src', 'nested', 'entry.mjs')
    expect(find(pathToFileURL(entry))).toBe(join(app, 'package.json'))
    expect(find(pathToFileURL(entry).href)).toBe(join(app, 'package.json'))
    expect(find(entry, base())).toBe(join(app, 'package.json'))
  })

  it('returns undefined when no package.json exists above the path', () => {
    expect(find('/', base())).toBeUndefined()
  })

  it('throws ERR_MODULE_NOT_FOUND for missing targets', () => {
    expect(() => find('does-not-exist', base())).toThrow(expect.objectContaining({ code: 'ERR_MODULE_NOT_FOUND' }))
    expect(() => find('./missing/file.mjs', base())).toThrow(expect.objectContaining({ code: 'ERR_MODULE_NOT_FOUND' }))
  })
})

describe('findPackageJSON without native support', () => {
  // Simulates Bun on Node; on runtimes without the native API the suites above already cover the fallback.
  it.skipIf(!hasNative)('falls back when node:module has no findPackageJSON (Bun)', async () => {
    vi.resetModules()
    vi.doMock('node:module', async () => {
      const actual = await vi.importActual<typeof import('node:module')>('node:module')
      return { ...actual, findPackageJSON: undefined }
    })
    try {
      const mod = await import('../../src/package-json')
      expect(normalize(mod.findPackageJSON('plain', pathToFileURL(join(app, 'package.json')))))
        .toBe(join(app, 'node_modules', 'plain', 'package.json'))
      expect(mod.findPackageJSON('./', pathToFileURL(join(app, 'src', 'nested', 'entry.mjs')))).toBe(join(app, 'package.json'))
    }
    finally {
      vi.doUnmock('node:module')
      vi.resetModules()
    }
  })
})

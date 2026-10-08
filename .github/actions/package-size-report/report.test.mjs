import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
// This action must remain dependency-free so consumer repositories can run it.
// eslint-disable-next-line test/no-import-node-test
import { after, it } from 'node:test'
import { collectSnapshot, renderReport } from './report.mjs'

const temporaryDirectories = []

after(() => {
  for (const directory of temporaryDirectories)
    rmSync(directory, { force: true, recursive: true })
})

function makeRepository(files) {
  const root = mkdtempSync(resolve(tmpdir(), 'package-size-report-'))
  temporaryDirectories.push(root)
  const packageDirectory = resolve(root, 'packages/module')
  mkdirSync(resolve(packageDirectory, 'dist/runtime/app'), { recursive: true })
  mkdirSync(resolve(packageDirectory, 'dist/runtime/server'), { recursive: true })
  writeFileSync(resolve(packageDirectory, 'package.json'), JSON.stringify({
    dependencies: {
      'ofetch': '^1.5.0',
      'paid-dep': '^2.0.0',
    },
    exports: {
      '.': {
        default: './dist/module.mjs',
        types: './dist/types.d.mts',
      },
    },
    files: ['dist'],
    name: '@example/module',
  }))
  mkdirSync(resolve(packageDirectory, 'node_modules/nuxt'), { recursive: true })
  mkdirSync(resolve(packageDirectory, 'node_modules/ofetch/dist'), { recursive: true })
  mkdirSync(resolve(packageDirectory, 'node_modules/paid-dep/dist'), { recursive: true })
  writeFileSync(resolve(packageDirectory, 'node_modules/nuxt/package.json'), JSON.stringify({
    dependencies: { ofetch: '^1.5.0' },
    version: '4.5.1',
  }))
  writeFileSync(resolve(packageDirectory, 'node_modules/ofetch/package.json'), JSON.stringify({
    files: ['dist'],
    version: '1.5.1',
  }))
  writeFileSync(resolve(packageDirectory, 'node_modules/ofetch/dist/index.mjs'), 'export const fetch = true\n')
  writeFileSync(resolve(packageDirectory, 'node_modules/paid-dep/package.json'), JSON.stringify({
    files: ['dist'],
    version: '2.1.0',
  }))
  writeFileSync(resolve(packageDirectory, 'node_modules/paid-dep/dist/index.mjs'), 'export const paid = true\n')
  for (const [path, contents] of Object.entries(files))
    writeFileSync(resolve(packageDirectory, path), contents)
  return root
}

it('measures built code and labels dependency declarations separately', () => {
  const repository = makeRepository({
    'dist/module.mjs': 'export default 1\n',
    'dist/runtime/app/plugin.js': 'export const app = true\n',
    'dist/runtime/server/handler.js': 'export const server = true\n',
  })
  const snapshot = collectSnapshot(repository)

  assert.equal(snapshot.get('packages/module:payload').size, 68)
  assert.match(renderReport(snapshot, snapshot), /Declared dependencies/)
  assert.doesNotMatch(renderReport(snapshot, snapshot), /free via Nuxt|Runtime dependencies/)
})

it('reports growth and removed output against the base build', () => {
  const largerModule = Array.from({ length: 100 }, (_, index) => `export const value${index} = ${index}\n`).join('')
  const largerRuntime = Array.from({ length: 100 }, (_, index) => `export const appValue${index} = ${index}\n`).join('')
  const baseRepository = makeRepository({
    'dist/module.mjs': 'export default 1\n',
    'dist/runtime/app/plugin.js': 'export const app = true\n',
    'dist/runtime/server/handler.js': 'export const server = true\n',
  })
  const headRepository = makeRepository({
    'dist/module.mjs': largerModule,
    'dist/runtime/app/plugin.js': largerRuntime,
  })

  const report = renderReport(
    collectSnapshot(baseRepository),
    collectSnapshot(headRepository),
    'main @ abc123',
  )

  assert.match(report, /Nuxt Module Size Analyzer<\/h3>/)
  assert.match(report, /icon-green\.svg.+alt="Nuxt logo"/)
  assert.match(report, /server source files.+removed/)
  assert.match(report, /Baseline: main @ abc123/)
  assert.match(report, /paid-dep.+\^2.0.0/)
})

it('ignores repositories without published dist metadata', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'package-size-report-'))
  temporaryDirectories.push(root)
  mkdirSync(resolve(root, 'dist'), { recursive: true })
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ private: true, files: ['dist'] }))
  writeFileSync(resolve(root, 'dist/stale.mjs'), 'export {}\n')

  assert.equal(collectSnapshot(root).size, 0)
})

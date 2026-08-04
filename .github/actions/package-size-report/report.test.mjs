import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
// This action must remain dependency-free so consumer repositories can run it.
// eslint-disable-next-line test/no-import-node-test
import { after, it } from 'node:test'
import { collectSnapshot, renderReport, satisfiesVersion } from './report.mjs'

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

it('collects exports, runtime groups, and published payload', () => {
  const repository = makeRepository({
    'dist/module.mjs': 'export default 1\n',
    'dist/runtime/app/plugin.js': 'export const app = true\n',
    'dist/runtime/server/handler.js': 'export const server = true\n',
  })
  const snapshot = collectSnapshot(repository)

  assert.deepEqual([...snapshot.keys()], [
    'packages/module:export:.',
    'packages/module:runtime:app',
    'packages/module:runtime:server',
    'packages/module:payload',
    'packages/module:dependency:ofetch',
    'packages/module:dependency:paid-dep',
  ])
  assert.equal(snapshot.get('packages/module:dependency:ofetch').free, true)
  assert.equal(snapshot.get('packages/module:dependency:paid-dep').free, false)
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

  assert.match(report, /^### 📦 Package Size/)
  assert.match(report, /size metrics grew/)
  assert.match(report, /server runtime.+removed/)
  assert.match(report, /Baseline: main_@_abc123/)
  assert.match(report, /free via Nuxt 4.5.1/)
  assert.match(report, /paid-dep.+2.1.0.+📦/)
})

it('matches common Nuxt dependency semver ranges', () => {
  assert.equal(satisfiesVersion('4.5.1', '^3.16.0 || ^4.0.0 || ^5.0.0'), true)
  assert.equal(satisfiesVersion('1.5.1', '^1.5.0'), true)
  assert.equal(satisfiesVersion('2.0.0', '^1.5.0'), false)
  assert.equal(satisfiesVersion('3.5.40', '>=3.5.0 <4.0.0'), true)
  assert.equal(satisfiesVersion('4.0.0-alpha.7', '4.0.0-alpha.7'), true)
  assert.equal(satisfiesVersion('4.5.1', 'catalog:'), false)
})

it('ignores repositories without published dist metadata', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'package-size-report-'))
  temporaryDirectories.push(root)
  mkdirSync(resolve(root, 'dist'), { recursive: true })
  writeFileSync(resolve(root, 'package.json'), JSON.stringify({ private: true }))
  writeFileSync(resolve(root, 'dist/stale.mjs'), 'export {}\n')

  assert.equal(collectSnapshot(root).size, 0)
})

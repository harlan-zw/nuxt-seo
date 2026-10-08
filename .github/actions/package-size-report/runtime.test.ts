import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
// This action runs without the consumer's test framework.
// eslint-disable-next-line test/no-import-node-test
import { it } from 'node:test'
import { measureOutput } from './runtime.ts'

it('measures deployed server dependencies and ignores source maps', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'runtime-size-'))
  try {
    mkdirSync(resolve(root, 'server/node_modules/dependency'), { recursive: true })
    mkdirSync(resolve(root, 'public/_nuxt'), { recursive: true })
    writeFileSync(resolve(root, 'server/index.mjs'), 'server')
    writeFileSync(resolve(root, 'server/index.mjs.map'), 'unused'.repeat(1000))
    writeFileSync(resolve(root, 'server/node_modules/dependency/index.mjs'), 'external')
    writeFileSync(resolve(root, 'server/node_modules/dependency/package.json'), '{}')
    writeFileSync(resolve(root, 'public/_nuxt/app.js'), 'client')
    writeFileSync(resolve(root, 'public/_nuxt/app.js.map'), 'unused'.repeat(1000))
    const result = measureOutput(root)
    assert.equal(result.server.size, 16)
    assert.equal(result.client.size, 6)
    assert.ok(result.client.gzipSize > 0)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

it('rejects missing build output instead of reporting zero runtime', () => {
  assert.throws(() => measureOutput('/missing-build'), /Missing server build output/)
})

it('includes linked deployment files once and stops directory cycles', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'runtime-links-'))
  try {
    mkdirSync(resolve(root, 'server'), { recursive: true })
    mkdirSync(resolve(root, 'public'), { recursive: true })
    writeFileSync(resolve(root, 'server/index.mjs'), 'server')
    writeFileSync(resolve(root, 'binary.node'), 'native')
    symlinkSync(resolve(root, 'binary.node'), resolve(root, 'server/binary.node'))
    symlinkSync(resolve(root, 'server'), resolve(root, 'server/cycle'))
    assert.equal(measureOutput(root).server.size, 12)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
})

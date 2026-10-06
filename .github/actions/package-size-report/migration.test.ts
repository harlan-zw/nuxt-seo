import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
// This action runs without installing repository dependencies.
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { collectSnapshot, renderReport } from './report.mjs'

test('reports target output without counting migration source packages', async () => {
  const root = await mkdtemp(join(tmpdir(), 'migration-size-report-'))
  try {
    for (const directory of ['packages/target', '.migration-sources/imported', '.migration-checkouts/imported', '.migration-artifacts/imported']) {
      const target = directory === 'packages/target'
      const location = join(root, directory)
      await mkdir(join(location, 'dist'), { recursive: true })
      await writeFile(join(location, 'package.json'), JSON.stringify({
        name: target ? '@example/target' : '@example/imported',
        files: ['dist'],
        exports: './dist/index.mjs',
      }))
      await writeFile(join(location, 'dist/index.mjs'), 'export const value = 1\n')
    }
    const report = renderReport(new Map(), collectSnapshot(root))
    assert.match(report, /@example\/target/)
    assert.doesNotMatch(report, /@example\/imported/)
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})

import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
// These boundaries must run before the unpublished graph can install test tools.
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { promisify } from 'node:util'
import { consumerArtifacts } from './migration-config.ts'

const execute = promisify(execFile)

test('supplies Core producers when the meta runner only packs itself', () => {
  const artifacts = [{ sourceId: 'core', name: 'nuxtseo-shared', path: '/runner/artifacts/shared.tgz' }]
  assert.deepEqual(consumerArtifacts('core', artifacts), { 'nuxtseo-shared': '/runner/artifacts/shared.tgz' })
})

test('lets a standalone runner replace its own freshly packed module', () => {
  const artifacts = [{ sourceId: 'robots', name: '@nuxtjs/robots', path: '/runner/artifacts/robots.tgz' }, { sourceId: 'core', name: 'nuxtseo-shared', path: '/runner/artifacts/shared.tgz' }]
  assert.deepEqual(consumerArtifacts('robots', artifacts), { 'nuxtseo-shared': '/runner/artifacts/shared.tgz' })
})

test('refuses unknown output without replacing caller-owned evidence', async () => {
  const scratchRoot = process.env.RUNNER_TEMP || join(homedir(), 'scratch')
  await mkdir(scratchRoot, { recursive: true })
  const scratch = await mkdtemp(join(scratchRoot, 'migration-boundary-'))
  const target = join(scratch, 'source')
  const output = join(scratch, 'output')
  await mkdir(target)
  await mkdir(output)
  await mkdir(join(scratch, 'checkouts'))
  await writeFile(join(output, 'sentinel.txt'), 'Preserve the caller file.')
  await writeFile(join(target, 'package.json'), '{"name":"example","private":true}')
  await writeFile(join(target, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
  await execute('git', ['init', target])
  await execute('git', ['-C', target, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '--allow-empty', '-m', 'test: create fixture'])
  const { stdout } = await execute('git', ['-C', target, 'rev-parse', 'HEAD'])
  await writeFile(join(scratch, 'sources.json'), JSON.stringify({ sources: [{ id: 'example', repository: 'example/example', ref: stdout.trim(), packages: [] }] }))
  try {
    await assert.rejects(execute(process.execPath, [join(import.meta.dirname, 'bootstrap-migration.ts'), '--target', target, '--target-id', 'example', '--source-root', join(scratch, 'checkouts'), '--source-manifest', join(scratch, 'sources.json'), '--output', output, '--mode', 'generate']), /recognized migration workspace/)
    assert.equal(await readFile(join(output, 'sentinel.txt'), 'utf8'), 'Preserve the caller file.')
  }
  finally {
    await rm(scratch, { recursive: true, force: true })
  }
})

test('copies a symlinked source without rewriting its original package', async () => {
  const scratch = await mkdtemp(join(process.env.RUNNER_TEMP || join(homedir(), 'scratch'), 'migration-symlink-'))
  const target = join(scratch, 'target')
  const source = join(scratch, 'original')
  const roots = join(scratch, 'checkouts')
  const output = join(scratch, 'output')
  const original = { name: 'external-example', version: '1.0.0', type: 'module', dependencies: { nuxt: 'catalog:' } }
  try {
    for (const directory of [target, source, roots])
      await mkdir(directory)
    await writeFile(join(target, 'package.json'), '{"name":"example-target","private":true,"packageManager":"pnpm@12.8.1"}')
    await writeFile(join(source, 'package.json'), JSON.stringify(original))
    for (const directory of [target, source]) {
      await writeFile(join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\ncatalog:\n  nuxt: 4.6.0\n')
      await execute('git', ['init', directory])
      await execute('git', ['-C', directory, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '--allow-empty', '-m', 'test: create fixture'])
    }
    const targetRef = (await execute('git', ['-C', target, 'rev-parse', 'HEAD'])).stdout.trim()
    const sourceRef = (await execute('git', ['-C', source, 'rev-parse', 'HEAD'])).stdout.trim()
    await symlink(source, join(roots, 'external'))
    const manifest = join(scratch, 'sources.json')
    await writeFile(manifest, JSON.stringify({ sources: [
      { id: 'example', repository: 'example/target', ref: targetRef, packages: [] },
      { id: 'external', repository: 'example/external', ref: sourceRef, packages: [{ name: original.name, version: '1.0.0', directory: '.', pack: true }] },
    ] }))
    await execute(process.execPath, [join(import.meta.dirname, 'bootstrap-migration.ts'), '--target', target, '--target-id', 'example', '--source-root', roots, '--source-manifest', manifest, '--output', output, '--mode', 'generate'])
    assert.deepEqual(JSON.parse(await readFile(join(source, 'package.json'), 'utf8')), original)
    const generated = JSON.parse(await readFile(join(output, '.migration-sources/external/package.json'), 'utf8'))
    assert.equal(generated.dependencies.nuxt, 'catalog:migration-external-default')
    const donor = join(scratch, 'caller-package.json')
    await writeFile(donor, JSON.stringify(original))
    await rm(join(source, 'package.json'))
    await symlink(donor, join(source, 'package.json'))
    await assert.rejects(execute(process.execPath, [join(import.meta.dirname, 'bootstrap-migration.ts'), '--target', target, '--target-id', 'example', '--source-root', roots, '--source-manifest', manifest, '--output', output, '--mode', 'generate']), /writes must remain inside the owned workspace/)
    assert.deepEqual(JSON.parse(await readFile(donor, 'utf8')), original)
  }
  finally {
    await rm(scratch, { recursive: true, force: true })
  }
})

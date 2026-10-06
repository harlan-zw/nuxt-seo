import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
// The boundary tests run before the unpublished workspace can install Vitest.
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { promisify } from 'node:util'
import { assertReleasePackage, catalogEntries, foundationWorkspace } from './foundation-config.ts'

function bootstrap(output: string) {
  return promisify(execFile)(process.execPath, [
    join(import.meta.dirname, 'bootstrap-foundation.ts'),
    '--output',
    output,
    '--site-source',
    process.env.FOUNDATION_TEST_SITE_SOURCE!,
    '--workspace-source',
    process.env.FOUNDATION_TEST_WORKSPACE_SOURCE || join(import.meta.dirname, '../pnpm-workspace.yaml'),
    '--mode',
    'generate',
  ])
}

async function scratchDirectory() {
  const scratch = process.env.RUNNER_TEMP || join(homedir(), 'scratch')
  await mkdir(scratch, { recursive: true })
  return mkdtemp(join(scratch, 'foundation-output-guard-'))
}

test('rejects publication of the meta module and Site companions', () => {
  for (const name of ['@nuxtjs/seo', 'nuxt-site-config', 'nuxt-site-config-kit', 'site-config-stack'])
    assert.throws(() => assertReleasePackage(name), /does not permit/)
  assert.doesNotThrow(() => assertReleasePackage('nuxtseo-shared'))
})

test('rejects transient absolute tarball overrides before source bootstrap', () => {
  const policy = 'catalog:\n  nuxt: 4.6.0\noverrides:\n  nuxtseo-shared: file:/scratch/shared.tgz\n'
  assert.throws(() => foundationWorkspace(policy, 'catalog:\n  nuxt: 4.6.0\n'), /absolute file dependencies/)
})

test('rejects unresolved policy conflicts rather than selecting a hidden side', () => {
  const policy = '<<<<<<< HEAD\ncatalog:\n  nuxt: 4.6.0\n=======\n>>>>>>> main\n'
  assert.throws(() => foundationWorkspace(policy, 'catalog:\n  nuxt: 4.6.0\n'), /Resolve workspace conflicts/)
})

test('resolves quoted catalog names and fails unsupported nested entries', () => {
  assert.equal(catalogEntries('catalog:\n  \'@nuxt/kit\': ^4.6.0\n').get('@nuxt/kit'), '^4.6.0')
  assert.throws(() => catalogEntries('catalog:\n  nuxt:\n    version: 4.6.0\n'), /Unsupported foundation catalog entry/)
})

test('refuses unknown output before replacing a caller-owned package directory', { skip: !process.env.FOUNDATION_TEST_SITE_SOURCE }, async () => {
  const output = await scratchDirectory()
  const sentinel = join(output, 'packages/shared/sentinel.txt')
  await mkdir(join(output, 'packages/shared'), { recursive: true })
  await writeFile(sentinel, 'Preserve caller-owned evidence.')
  try {
    await assert.rejects(bootstrap(output), /recognized foundation workspace/)
    assert.equal(await readFile(sentinel, 'utf8'), 'Preserve caller-owned evidence.')
  }
  finally {
    await rm(output, { recursive: true, force: true })
  }
})

test('retries a marked partial workspace and preserves separate evidence', { skip: !process.env.FOUNDATION_TEST_SITE_SOURCE }, async () => {
  const output = await scratchDirectory()
  try {
    await bootstrap(output)
    await writeFile(join(output, 'evidence.txt'), 'Keep the rehearsal log.')
    await rm(join(output, 'site/packages/module'), { recursive: true })
    await bootstrap(output)
    assert.equal(await readFile(join(output, 'evidence.txt'), 'utf8'), 'Keep the rehearsal log.')
    const manifest = JSON.parse(await readFile(join(output, 'site/packages/module/package.json'), 'utf8'))
    assert.equal(manifest.name, 'nuxt-site-config')
  }
  finally {
    await rm(output, { recursive: true, force: true })
  }
})

test('rejects a source directory reached through an output symlink', { skip: !process.env.FOUNDATION_TEST_SITE_SOURCE }, async () => {
  const scratch = await scratchDirectory()
  try {
    const output = join(scratch, 'source-link/new-output')
    await symlink(join(import.meta.dirname, '..'), join(scratch, 'source-link'))
    await assert.rejects(bootstrap(output), /outside both source repositories/)
  }
  finally {
    await rm(scratch, { recursive: true, force: true })
  }
})

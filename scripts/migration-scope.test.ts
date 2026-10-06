import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
// The framework tools exist only after the bootstrap graph installs.
// eslint-disable-next-line test/no-import-node-test
import { test } from 'node:test'
import { promisify } from 'node:util'

const execute = promisify(execFile)
const tools = process.env.MIGRATION_SCOPE_TOOL_ROOT

for (const producerDirectory of ['.', 'packages/module']) {
  test(`checks ${producerDirectory} producer files without importing unrelated target tests`, { skip: !tools }, async () => {
    const require = createRequire(join(tools!, 'package.json'))
    const { loadNuxt } = require(join(dirname(require.resolve('nuxt/package.json')), 'dist/index.mjs'))
    const { writeTypes } = require(join(dirname(require.resolve('@nuxt/kit/package.json')), 'dist/index.mjs'))
    const ts = require('typescript')
    const scratch = await mkdtemp(join(process.env.RUNNER_TEMP || join(homedir(), 'scratch'), 'migration-native-scope-'))
    const target = join(scratch, 'target')
    const original = join(scratch, 'source-root/external')
    const output = join(scratch, 'output')
    try {
      for (const directory of [target, original]) {
        await mkdir(directory, { recursive: true })
        await writeFile(join(directory, 'package.json'), JSON.stringify({ name: directory === target ? 'target' : producerDirectory === '.' ? 'producer' : 'source-root', version: '1.0.0', type: 'module', packageManager: 'pnpm@12.8.1', ...(directory === target ? { exports: './module.ts' } : {}) }))
        await writeFile(join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
        await writeFile(join(directory, '.nuxtrc'), 'typescript.includeWorkspace=true\n')
        await execute('git', ['init', directory])
        await execute('git', ['-C', directory, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '--allow-empty', '-m', 'test: create scope fixture'])
      }
      if (producerDirectory !== '.') {
        await mkdir(join(original, producerDirectory), { recursive: true })
        await writeFile(join(original, producerDirectory, 'package.json'), JSON.stringify({ name: 'producer', version: '1.0.0', type: 'module' }))
      }
      const targetRef = (await execute('git', ['-C', target, 'rev-parse', 'HEAD'])).stdout.trim()
      const sourceRef = (await execute('git', ['-C', original, 'rev-parse', 'HEAD'])).stdout.trim()
      const manifest = join(scratch, 'sources.json')
      await writeFile(manifest, JSON.stringify({ sources: [
        { id: 'example', repository: 'example/target', ref: targetRef, packages: [] },
        { id: 'external', repository: 'example/external', ref: sourceRef, packages: [{ name: 'producer', version: '1.0.0', directory: producerDirectory, pack: true }] },
      ] }))
      await writeFile(join(target, 'unrelated-target.test.ts'), 'export const unrelated = true\n')
      await writeFile(join(target, '.nuxtrc'), 'typescript.includeWorkspace=true\nmodules[]=target\n')
      await writeFile(join(target, 'module.ts'), 'export default function (_options, nuxt) { nuxt.options.runtimeConfig.targetModuleExecuted = true }\n')
      await writeFile(join(original, 'producer.test.ts'), 'export const producer = true\n')
      await execute(process.execPath, [join(import.meta.dirname, 'bootstrap-migration.ts'), '--target', target, '--target-id', 'example', '--source-root', join(scratch, 'source-root'), '--source-manifest', manifest, '--output', output, '--mode', 'generate'])
      const root = join(output, '.migration-sources/external', producerDirectory)
      const nuxt = await loadNuxt({ cwd: root, ready: false, overrides: { telemetry: false, devtools: { enabled: false }, modulesDir: [join(tools!, 'node_modules')] } })
      try {
        await nuxt.ready()
        assert.equal(nuxt.options.runtimeConfig.targetModuleExecuted, true)
        await writeTypes(nuxt)
        const config = ts.getParsedCommandLineOfConfigFile(join(root, '.nuxt/tsconfig.json'), {}, ts.sys)
        assert.ok(config.fileNames.includes(join(output, '.migration-sources/external/producer.test.ts')))
        assert.ok(!config.fileNames.includes(join(output, 'unrelated-target.test.ts')))
      }
      finally {
        await nuxt.close()
      }
    }
    finally {
      await rm(scratch, { recursive: true, force: true })
    }
  })
}

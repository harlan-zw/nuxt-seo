import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

type Lane = 'nuxt4' | 'future5' | 'nuxt5'
const lanes: Lane[] = ['nuxt4', 'future5', 'nuxt5']
const root = resolve(import.meta.dirname, '..')
const fixture = join(root, 'test/fixtures/nitro-compat-nuxt5')
const selected = process.argv[2]
if (selected && !lanes.includes(selected as Lane))
  throw new Error(`Unknown Nuxt lane: ${selected}`)

function run(args: string[], cwd: string, lane: Lane): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd,
      env: { ...process.env, NUXT_TEST_LANE: lane },
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`pnpm failed: ${signal || code}`)))
  })
}

const scratch = join(homedir(), 'scratch')
await mkdir(scratch, { recursive: true })
for (const lane of selected ? [selected as Lane] : lanes) {
  const consumer = await mkdtemp(join(scratch, `nuxt-shared-${lane}-`))
  console.log(`Packed Shared lane ${lane}: ${consumer}`)
  try {
    await cp(fixture, consumer, {
      recursive: true,
      filter: path => !/(?:^|\/)(?:node_modules|\.nuxt|\.output|\.data)(?:\/|$)/.test(path) && !path.endsWith('.tgz'),
    })
    await rm(join(consumer, 'pnpm-lock.yaml'), { force: true })
    const manifestFile = join(consumer, 'package.json')
    const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
    const moduleName = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).name as string
    const artifact = String(manifest.dependencies[moduleName]).replace(/^file:(?:\.\/)?/, '')
    manifest.dependencies.nuxt = lane === 'nuxt5' ? 'npm:nuxt-nightly@5.0.0-2610052343-36eafab' : '4.6.0'
    if (lane !== 'nuxt5') {
      delete manifest.dependencies.nitro
      delete manifest.dependencies.nitropack
    }
    const tarballs: Record<string, string> = JSON.parse(process.env.NUXT_TEST_TARBALLS || '{}')
    // The package under test must use this consumer's fresh pack, not a cached producer path.
    tarballs[moduleName] = join(consumer, artifact)
    for (const [name, path] of Object.entries(tarballs)) {
      if (!path.startsWith('/'))
        throw new Error(`Packed dependency requires an absolute path: ${name}`)
      if (manifest.dependencies[name])
        manifest.dependencies[name] = `file:${path}`
      if (manifest.devDependencies?.[name])
        manifest.devDependencies[name] = `file:${path}`
    }
    const workspaceFile = join(consumer, 'pnpm-workspace.yaml')
    let workspace = await readFile(workspaceFile, 'utf8')
    const rootWorkspace = await readFile(join(root, '../../pnpm-workspace.yaml'), 'utf8')
    workspace = 'trustPolicy: no-downgrade\ntrustPolicyIgnoreAfter: 262800\nallowBuilds:\n  esbuild: true\ntrustPolicyExclude:\n  - cssnano@9.2.2\n'
    const cssExceptions = rootWorkspace.match(/^trustPolicyExclude:\n((?: {2}- .*\n)+)/m)?.[1] || ''
    workspace = workspace.replace(/^trustPolicyExclude:\n(?: {2}- .*\n)+/m, `trustPolicyExclude:\n${cssExceptions}`)
    const overrides = Object.entries(tarballs).map(([name, path]) => `  '${name}': 'file:${path}'\n`).join('')
    const cssPins = [...cssExceptions.matchAll(/ {2}- (cssnano(?:-preset-default|-utils)?|postcss-[\w-]+|stylehacks)@([\d.]+)/g)].map(([, name, version]) => `  '${name}': '${version}'\n`).join('')
    if (!/^overrides:\n/m.test(workspace))
      workspace += '\noverrides:\n'
    workspace = workspace.replace(/^overrides:\n/m, `overrides:\n${overrides}${cssPins}`)
    await writeFile(workspaceFile, workspace)
    await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
    await run(['--config.ignore-scripts=true', 'pack', '--out', join(consumer, artifact)], root, lane)
    await run(['install', '--no-frozen-lockfile', '--update-checksums'], consumer, lane)
    await run(['test'], consumer, lane)
    console.log(`Passed packed Shared lane ${lane}, Node ${process.version}`)
  }
  finally {
    if (process.env.NUXT_TEST_KEEP_FIXTURE !== '1')
      await rm(consumer, { recursive: true, force: true })
  }
}

import { spawn } from 'node:child_process'
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'

type Lane = 'nuxt4' | 'future5' | 'nuxt5'
const lanes: Lane[] = ['nuxt4', 'future5', 'nuxt5']
const root = resolve(import.meta.dirname, '..')
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

// Required CI builds the package before this runner. Packs use that exact build.
const packages = [{ directory: '.', name: '@nuxtjs/seo', artifact: 'module.tgz' }]
const scratch = join(homedir(), 'scratch')
await mkdir(scratch, { recursive: true })
for (const lane of selected ? [selected as Lane] : lanes) {
  const consumer = await mkdtemp(join(scratch, `${basename(root)}-${lane}-`))
  console.log(`Nuxt lane ${lane}: ${consumer}`)
  try {
    await cp(join(root, 'test/fixtures/nuxt46'), consumer, {
      recursive: true,
      filter: path => !/(?:^|\/)(?:node_modules|\.nuxt|\.output|\.data)(?:\/|$)/.test(path)
        && !path.endsWith('.tgz') && !path.endsWith('/pnpm-lock.yaml'),
    })
    const manifestFile = join(consumer, 'package.json')
    const manifest = JSON.parse(await readFile(manifestFile, 'utf8'))
    manifest.dependencies.nuxt = lane === 'nuxt5' ? 'npm:nuxt-nightly@5.0.0-2610052343-36eafab' : '4.6.0'
    if (lane === 'nuxt5') {
      manifest.dependencies.nitro = '3.0.260903-beta'
      manifest.dependencies.nitropack = 'npm:nitro@3.0.260903-beta'
    }
    if (process.env.NUXT_TEST_STANDALONE === '0') {
      delete manifest.dependencies['nuxt-ai-ready']
      delete manifest.dependencies['nuxt-skew-protection']
    }
    const tarballs: Record<string, string> = JSON.parse(process.env.NUXT_TEST_TARBALLS || '{}')
    let workspace = await readFile(join(consumer, 'pnpm-workspace.yaml'), 'utf8')
    const rootWorkspace = await readFile(join(root, '../../pnpm-workspace.yaml'), 'utf8')
    const cssExceptions = rootWorkspace.match(/^trustPolicyExclude:\n((?: {2}- .*\n)+)/m)?.[1] || ''
    workspace = workspace.replace(/^trustPolicyExclude:\n(?: {2}- .*\n)+/m, `trustPolicyExclude:\n${cssExceptions}`)
    const overrides: Record<string, string> = { ...Object.fromEntries(Object.entries(tarballs).map(([name, path]) => {
      if (!path.startsWith('/'))
        throw new Error(`Packed dependency requires an absolute path: ${name}`)
      return [name, `file:${path}`]
    })) }
    for (const { directory, name, artifact } of packages) {
      await run(['--config.verify-deps-before-run=false', '--config.ignore-scripts=true', 'pack', '--out', join(consumer, artifact)], join(root, directory), lane)
      overrides[name] = `file:./${artifact}`
    }
    for (const [name, source] of Object.entries(overrides)) {
      if (manifest.dependencies[name])
        manifest.dependencies[name] = source
      if (manifest.devDependencies?.[name])
        manifest.devDependencies[name] = source
    }
    // Replace matching entries instead of producing duplicate YAML override keys.
    for (const [name, source] of Object.entries(overrides)) {
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      workspace = workspace.replace(new RegExp(`^  (?:['"])?${escaped}(?:['"])?\\s*:[^\\n]*\\n`, 'gm'), '')
      workspace = workspace.replace(/^overrides:\n/m, `overrides:\n  ${JSON.stringify(name)}: ${JSON.stringify(source)}\n`)
    }
    await writeFile(join(consumer, 'pnpm-workspace.yaml'), workspace)
    await writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`)
    await run(['install', '--no-frozen-lockfile', '--update-checksums'], consumer, lane)
    await run(['test'], consumer, lane)
    console.log(`Passed packed Nuxt lane: ${lane}, Node ${process.version}`)
  }
  finally {
    if (process.env.NUXT_TEST_KEEP_FIXTURE !== '1')
      await rm(consumer, { recursive: true, force: true })
  }
}

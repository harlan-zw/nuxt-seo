import { spawn } from 'node:child_process'
import { cp, mkdir, readdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, resolve } from 'node:path'
import { foundationPackages, foundationWorkspace, packageArtifact, siteConfigRef } from './foundation-config.ts'

const root = resolve(import.meta.dirname, '..')
const argumentsByName = new Map<string, string>()
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index]!
  const value = process.argv[index + 1]
  if (!['--output', '--site-source', '--workspace-source', '--mode'].includes(name) || !value)
    throw new Error('Use --output PATH --site-source PATH --mode generate|install|build|test|pack.')
  argumentsByName.set(name, value)
}
const outputArgument = argumentsByName.get('--output')
const siteSourceArgument = argumentsByName.get('--site-source')
const output = outputArgument && resolve(outputArgument)
const siteSource = siteSourceArgument && resolve(siteSourceArgument)
const mode = argumentsByName.get('--mode') || 'generate'
const workspaceSource = argumentsByName.get('--workspace-source') || join(root, 'pnpm-workspace.yaml')
if (!outputArgument || !siteSourceArgument || !isAbsolute(outputArgument) || !isAbsolute(siteSourceArgument))
  throw new Error('Foundation output and Site Config source paths must be absolute.')
if (!['generate', 'install', 'build', 'test', 'pack'].includes(mode))
  throw new Error('Unknown foundation bootstrap mode.')
if (!output || !siteSource || output === root || output.startsWith(`${root}/`) || output === siteSource || output.startsWith(`${siteSource}/`))
  throw new Error('Create the foundation workspace outside both source repositories.')

function command(args: string[], cwd = output!, executable = 'pnpm'): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(executable, args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] })
    let stdout = ''
    process.stdout.on('data', (chunk) => {
      stdout += chunk
      globalThis.process.stdout.write(chunk)
    })
    process.once('error', reject)
    process.once('exit', code => code === 0 ? resolve(stdout.trim()) : reject(new Error(`${executable} failed with status ${code}.`)))
  })
}

async function canonicalPath(path: string): Promise<string> {
  return realpath(path).catch(async (cause: NodeJS.ErrnoException) => {
    if (cause.code !== 'ENOENT')
      throw cause
    return join(await canonicalPath(dirname(path)), basename(path))
  })
}

async function claimOutput(): Promise<void> {
  const [destination, rootSource, site] = await Promise.all([canonicalPath(output!), realpath(root), realpath(siteSource!)])
  if ([rootSource, site].some(source => destination === source || destination.startsWith(`${source}/`)))
    throw new Error('Create the foundation workspace outside both source repositories.')
  const marker = join(output!, '.foundation-workspace')
  const identity = 'nuxt-seo-foundation-workspace-v1\n'
  const entries = await readdir(output!).catch((cause: NodeJS.ErrnoException) => {
    if (cause.code !== 'ENOENT')
      throw cause
    return []
  })
  if (entries.length) {
    const existing = await readFile(marker, 'utf8').catch((cause: NodeJS.ErrnoException) => {
      if (cause.code !== 'ENOENT')
        throw cause
      throw new Error('Existing output must be a recognized foundation workspace.')
    })
    if (existing !== identity)
      throw new Error('Existing output must be a recognized foundation workspace.')
  }
  await mkdir(output!, { recursive: true })
  await writeFile(marker, identity)
}

await claimOutput()
const actualSiteRef = await command(['rev-parse', 'HEAD'], siteSource, 'git')
if (actualSiteRef !== siteConfigRef)
  throw new Error(`Site Config must use pinned commit ${siteConfigRef}.`)
const rootManifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
const siteManifest = JSON.parse(await readFile(join(siteSource, 'package.json'), 'utf8'))
await writeFile(join(output, 'package.json'), `${JSON.stringify({
  name: 'nuxt-seo-foundation-bootstrap',
  private: true,
  type: 'module',
  packageManager: rootManifest.packageManager,
  devDependencies: Object.fromEntries(['typescript', 'unbuild', 'vitest', '@types/node', '@nuxt/module-builder', '@nuxt/test-utils']
    .map(name => [name, rootManifest.devDependencies?.[name] || siteManifest.devDependencies?.[name]])
    .filter(([, value]) => value)),
}, null, 2)}\n`)
await writeFile(join(output, 'pnpm-workspace.yaml'), foundationWorkspace(
  await readFile(workspaceSource, 'utf8'),
  await readFile(join(siteSource, 'pnpm-workspace.yaml'), 'utf8'),
))
for (const pkg of foundationPackages) {
  const sourceRoot = pkg.source === 'root' ? root : siteSource
  const manifest = JSON.parse(await readFile(join(sourceRoot, pkg.sourceDirectory, 'package.json'), 'utf8'))
  if (manifest.name !== pkg.name || manifest.version !== pkg.version)
    throw new Error(`Unexpected foundation package identity: ${pkg.name}.`)
  // Replace only this bootstrap's known package directories. Keep other scratch evidence.
  await rm(join(output, pkg.directory), { recursive: true, force: true })
  await cp(join(sourceRoot, pkg.sourceDirectory), join(output, pkg.directory), {
    recursive: true,
    filter: path => !/(?:^|\/)(?:node_modules|dist|\.git|\.nuxt|\.output|\.data)(?:\/|$)/.test(path) && !path.endsWith('.tgz'),
  })
}
await writeFile(join(output, 'foundation-sources.json'), `${JSON.stringify({ root: await command(['rev-parse', 'HEAD'], root, 'git'), site: siteConfigRef }, null, 2)}\n`)
if (mode === 'generate') {
  console.log(`Generated foundation sources in ${output}.`)
}
else {
  await cp(join(root, 'scripts/foundation-lock.yaml'), join(output, 'pnpm-lock.yaml'))
  await command(['install', '--frozen-lockfile', '--no-trust-lockfile'])
  if (mode !== 'install') {
    await command(['--filter', 'site-config-stack', 'build'])
    await command(['--filter', 'nuxt-site-config-kit', 'build'])
    await command(['--filter', 'nuxtseo-shared', 'stub'])
    await command(['--filter', 'nuxt-site-config', 'exec', 'nuxt-module-build', 'build', '--stub'])
    await command(['--filter', 'nuxtseo-shared', 'build'])
    await command(['--filter', 'nuxt-site-config', 'build'])
    await command(['--filter', 'nuxtseo-devtools-host', 'build'])
    if (mode === 'test' || mode === 'pack') {
      await command(['--filter', 'nuxtseo-shared', 'exec', 'vitest', 'run'])
      await command(['--filter', 'nuxtseo-devtools-host', 'test:run'])
      await command(['--filter', 'nuxtseo-layer-devtools', 'test:run'])
    }
    if (mode === 'pack') {
      const artifacts = join(output, 'artifacts')
      await mkdir(artifacts, { recursive: true })
      for (const pkg of foundationPackages)
        await command(['--config.ignore-scripts=true', 'pack', '--out', join(artifacts, packageArtifact(pkg.name, pkg.version))], join(output, pkg.directory))
    }
  }
}

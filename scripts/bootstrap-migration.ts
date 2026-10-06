import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { appendFile, cp, lstat, mkdir, readdir, readFile, realpath, rename, rm, symlink, writeFile as writeFileNative } from 'node:fs/promises'
import { basename, delimiter, dirname, join, relative, resolve } from 'node:path'
import { consumerArtifacts, migrationManifest, migrationWorkspace, parseMigrationManifest, scopeCatalogReferences } from './migration-config.ts'

const args = new Map<string, string>()
for (let index = 2; index < process.argv.length; index += 2) {
  const key = process.argv[index]!
  const value = process.argv[index + 1]
  if (!['--target', '--target-id', '--source-root', '--source-manifest', '--output', '--mode', '--lock-source'].includes(key) || !value)
    throw new Error('Use --target PATH --source-root PATH --output PATH --mode generate|install|build|pack.')
  args.set(key, value)
}
const target = resolve(args.get('--target') || '.')
const sourceRoot = resolve(args.get('--source-root') || '.')
const outputArgument = args.get('--output')
if (!outputArgument)
  throw new Error('Migration output is required.')
const output = resolve(outputArgument)
const mode = args.get('--mode') || 'generate'
if (!['generate', 'install', 'build', 'pack'].includes(mode))
  throw new Error('Unknown migration bootstrap mode.')
const manifest = parseMigrationManifest(args.has('--source-manifest')
  ? JSON.parse(await readFile(args.get('--source-manifest')!, 'utf8'))
  : migrationManifest)
let installState: 'pending' | 'verified' = 'pending'

function command(executable: string, arguments_: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const bins = [join(output, 'node_modules/.bin'), ...manifest.sources.map(source => join(output, '.migration-sources', source.id, 'node_modules/.bin'))]
    const actualArguments = executable === 'pnpm' && installState === 'verified'
      ? ['--config.verify-deps-before-run=false', ...arguments_]
      : arguments_
    const child = spawn(executable, actualArguments, { cwd, stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, ...(installState === 'verified' ? { npm_config_verify_deps_before_run: 'false' } : {}), PATH: [...bins, process.env.PATH || ''].join(delimiter) } })
    let stdout = ''
    child.stdout.on('data', (chunk) => {
      stdout += chunk
      if (executable !== 'git')
        process.stdout.write(chunk)
    })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve(stdout.trim()) : reject(new Error(`${executable} failed with status ${code}.`)))
  })
}

async function canonicalPath(path: string): Promise<string> {
  return realpath(path).catch(async (cause: NodeJS.ErrnoException) => {
    if (cause.code !== 'ENOENT')
      throw cause
    return join(await canonicalPath(dirname(path)), basename(path))
  })
}

const destination = await canonicalPath(output)
async function assertOwnedPath(path: string): Promise<void> {
  const canonical = await canonicalPath(path)
  if (!canonical.startsWith(`${destination}/`))
    throw new Error('Migration writes must remain inside the owned workspace.')
}

async function writeFile(path: string, contents: string): Promise<void> {
  await assertOwnedPath(path)
  await writeFileNative(path, contents)
}

const targetCanonical = await realpath(target)
const sourcesCanonical = await realpath(sourceRoot)
if ([targetCanonical, sourcesCanonical].some(source => destination === source || destination.startsWith(`${source}/`)))
  throw new Error('Create the migration workspace outside its source directories.')
const marker = join(output, '.migration-workspace')
const identity = 'nuxt-seo-migration-workspace-v1\n'
const entries = await readdir(output).catch((cause: NodeJS.ErrnoException) => {
  if (cause.code !== 'ENOENT')
    throw cause
  return []
})
if (entries.length) {
  const current = await readFile(marker, 'utf8').catch((cause: NodeJS.ErrnoException) => {
    if (cause.code !== 'ENOENT')
      throw cause
    throw new Error('Existing output must be a recognized migration workspace.')
  })
  if (current !== identity)
    throw new Error('Existing output must be a recognized migration workspace.')
}

const remote = await command('git', ['remote', 'get-url', 'origin'], target).catch((cause: Error) => {
  if (args.has('--target-id'))
    return '' // A local boundary fixture declares its target identity explicitly.
  throw cause
})
const repository = remote.replace(/^.*github\.com[:/]/, '').replace(/\.git$/, '')
const targetSource = manifest.sources.find(source => source.id === args.get('--target-id') || source.repository === repository)
if (!targetSource)
  throw new Error('The target repository must belong to the migration source manifest.')
const sources = manifest.sources.map(source => ({ ...source, path: source.id === targetSource.id ? target : join(sourceRoot, source.id) }))
for (const source of sources) {
  source.path = await realpath(source.path)
  if (destination === source.path || destination.startsWith(`${source.path}/`))
    throw new Error('Create the migration workspace outside its source directories.')
  const ref = await command('git', ['rev-parse', 'HEAD'], source.path)
  if (source.id !== targetSource.id && ref !== source.ref)
    throw new Error(`Migration source ${source.id} must use pinned commit ${source.ref}.`)
  if (source.id === targetSource.id)
    source.ref = ref
  if (source.id !== targetSource.id) {
    await command('git', ['diff', '--quiet', 'HEAD', '--'], source.path).catch((cause: Error) => {
      throw new Error(`Migration source ${source.id} requires clean tracked files.`, { cause })
    })
  }
  for (const pkg of source.packages) {
    const value = JSON.parse(await readFile(join(source.path, pkg.directory, 'package.json'), 'utf8'))
    if (value.name !== pkg.name || value.version !== pkg.version)
      throw new Error(`Unexpected migration package identity: ${pkg.name}.`)
  }
}

const excluded = /(?:^|\/)(?:node_modules|dist|\.git|\.nuxt|\.output|\.data|\.migration-sources|\.migration-checkouts|\.migration-artifacts|\.benchmark|\.pr-lens)(?:\/|$)/
const copyFilter = (path: string) => !excluded.test(path) && !path.endsWith('.tgz')
await mkdir(output, { recursive: true })
await writeFile(marker, identity)
// Remove only paths this workspace copied before. Keep separate caller evidence.
const inventory = join(output, '.migration-inventory.json')
const previous: string[] = await readFile(inventory, 'utf8').then(JSON.parse).catch((cause: NodeJS.ErrnoException) => {
  if (cause.code !== 'ENOENT')
    throw cause
  return []
})
for (const entry of previous) {
  if (!entry || entry.includes('/') || entry === '.' || entry === '..')
    throw new Error('Migration inventory contains an unsafe path.')
  await rm(join(output, entry), { recursive: true, force: true })
}
const copied = (await readdir(target)).filter(entry => copyFilter(join(target, entry)))
await writeFile(inventory, JSON.stringify(copied))
for (const entry of copied)
  await cp(join(target, entry), join(output, entry), { recursive: true, filter: path => copyFilter(relative(target, path)) })

await assertOwnedPath(join(output, '.gitignore'))
await appendFile(join(output, '.gitignore'), '\n.migration-sources/\n.migration-artifacts/\n.migration-checkouts/\n/pnpm-workspace.yaml\n/.migration-inventory.json\n/migration-sources.json\n/migration-artifacts.json\n/migration-consumer-artifacts.json\n')
const targetManifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8'))

const external = sources.filter(source => source.id !== targetSource.id)
const policies: { id: string, workspace: string, directories: string[] }[] = []
async function scopeNuxtProject(directory: string, workspace: string): Promise<void> {
  const entries = await readdir(directory)
  const configEntries = entries.includes('.config') ? await readdir(join(directory, '.config')) : []
  if (entries.some(name => /^nuxt\.config\.(?:ts|mts|cts|js|mjs|cjs|json|jsonc|json5|yaml|yml|toml)$/.test(name)) || configEntries.some(name => /^nuxt\.(?:ts|mts|cts|js|mjs|cjs|json|jsonc|json5|yaml|yml|toml)$/.test(name)))
    return
  const sourceWorkspace = relative(directory, workspace)
  await writeFile(join(directory, 'nuxt.config.ts'), sourceWorkspace
    ? `import { resolve } from 'node:path'\nexport default { workspaceDir: resolve(import.meta.dirname, ${JSON.stringify(sourceWorkspace)}) }\n`
    : 'export default { workspaceDir: import.meta.dirname }\n')
}
for (const source of external) {
  const sourceDirectory = `.migration-sources/${source.id}`
  const directory = join(output, sourceDirectory)
  await rm(directory, { recursive: true, force: true })
  await cp(source.path, directory, { recursive: true, filter: path => copyFilter(relative(source.path, path)) })
  const selected = ['.', ...source.packages.map(pkg => pkg.directory)].filter((value, index, all) => all.indexOf(value) === index)
  for (const selectedDirectory of selected) {
    await scopeNuxtProject(join(directory, selectedDirectory), directory)
    const path = join(directory, selectedDirectory, 'package.json')
    const value = JSON.parse(await readFile(path, 'utf8'))
    scopeCatalogReferences(value, source.id)
    if (!value.name)
      value.name = `@migration/${source.id}`
    if (selectedDirectory === '.')
      value.packageManager = targetManifest.packageManager
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`)
  }
  const workspace = await readFile(join(source.path, 'pnpm-workspace.yaml'), 'utf8')
  policies.push({ id: source.id, workspace, directories: selected.map(path => `${sourceDirectory}/${path}`) })
  // The verified target workspace owns dependency policy and package installation.
  await rm(join(directory, 'pnpm-workspace.yaml'))
}
await writeFile(join(output, 'pnpm-workspace.yaml'), migrationWorkspace(await readFile(join(target, 'pnpm-workspace.yaml'), 'utf8'), policies, sources.flatMap(source => source.packages.map(pkg => pkg.name))))
await writeFile(join(output, 'migration-sources.json'), `${JSON.stringify(sources.map(({ id, ref, repository }) => ({ id, ref, repository })), null, 2)}\n`)
async function linkTargetModule(): Promise<void> {
  const name: unknown = targetManifest.name
  if (name === undefined)
    return
  if (typeof name !== 'string' || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name))
    throw new Error('The target package must have a valid npm name.')
  const directories = [output, ...external.flatMap(source => ['.', ...source.packages.map(pkg => pkg.directory)]
    .map(directory => join(output, '.migration-sources', source.id, directory)))]
  for (const directory of new Set(directories)) {
    const link = join(directory, 'node_modules', name)
    await assertOwnedPath(dirname(link))
    const existing = await lstat(link).catch((cause: NodeJS.ErrnoException) => {
      if (cause.code !== 'ENOENT')
        throw cause
      return undefined
    })
    if (existing) {
      if (!existing.isSymbolicLink() || await realpath(link) !== destination)
        throw new Error('The target module link conflicts with an installed package.')
      continue
    }
    await mkdir(dirname(link), { recursive: true })
    await symlink(relative(dirname(link), output), link, 'dir')
  }
}
// Nuxt reads the target RC while preparing nested producers. Resolve its real module,
// without changing RC settings or declaring a production dependency on itself.
await linkTargetModule()
if (mode !== 'generate') {
  await assertOwnedPath(join(output, 'pnpm-lock.yaml'))
  await cp(args.get('--lock-source') || join(target, 'scripts/migration-lock.yaml'), join(output, 'pnpm-lock.yaml'))
  await command('pnpm', ['install', '--frozen-lockfile', '--no-trust-lockfile'], output)
  installState = 'verified'
  await linkTargetModule()
}
if (mode === 'build' || mode === 'pack') {
  await command('pnpm', ['--filter', 'site-config-stack', 'build'], output)
  await command('pnpm', ['--filter', 'nuxt-site-config-kit', 'build'], output)
  await command('pnpm', ['--filter', 'nuxtseo-shared', 'stub'], output)
  // Preparation can discover the target's Nuxt config through relocated ancestors.
  // Provide every entrypoint before preparing any member of this graph.
  for (const name of ['nuxt-site-config', '@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-og-image', 'nuxt-schema-org', 'nuxt-seo-utils', 'nuxt-link-checker', 'nuxt-ai-ready', 'nuxt-skew-protection'])
    await command('pnpm', ['--filter', name, 'exec', 'nuxt-module-build', 'build', '--stub'], output)
  const buildOrder = ['nuxtseo-shared', 'nuxt-site-config', 'nuxtseo-devtools-host', 'sitemapd', '@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-og-image', 'nuxt-schema-org', 'nuxt-seo-utils', 'nuxt-link-checker', 'nuxt-ai-ready', 'nuxt-skew-protection']
  for (const name of buildOrder)
    await command('pnpm', ['--filter', name, 'build'], output)
}
if (mode === 'pack') {
  const artifacts = join(output, '.migration-artifacts')
  await mkdir(artifacts, { recursive: true })
  const packed: Record<string, string> = {}
  const artifactEntries: { sourceId: string, name: string, path: string }[] = []
  for (const source of sources) {
    for (const pkg of source.packages.filter(pkg => pkg.pack)) {
      const prefix = `${pkg.name.replaceAll('@', '').replaceAll('/', '-')}-${pkg.version}`
      const temporary = join(artifacts, `${prefix}.tgz`)
      const directory = source.id === targetSource.id ? join(output, pkg.directory) : join(output, '.migration-sources', source.id, pkg.directory)
      await assertOwnedPath(temporary)
      await command('pnpm', ['--config.ignore-scripts=true', 'pack', '--out', temporary], directory)
      const hash = createHash('sha256').update(await readFile(temporary)).digest('hex')
      const path = join(artifacts, `${prefix}-${hash}.tgz`)
      await assertOwnedPath(path)
      await rename(temporary, path)
      packed[pkg.name] = path
      artifactEntries.push({ sourceId: source.id, name: pkg.name, path })
    }
  }
  await writeFile(join(output, 'migration-artifacts.json'), `${JSON.stringify(packed, null, 2)}\n`)
  const consumer = consumerArtifacts(targetSource.id, artifactEntries)
  await writeFile(join(output, 'migration-consumer-artifacts.json'), `${JSON.stringify(consumer, null, 2)}\n`)
  if (process.env.GITHUB_ENV)
    await appendFile(process.env.GITHUB_ENV, `NUXT_TEST_TARBALLS=${JSON.stringify(consumer)}\n`)
}
if (process.env.GITHUB_OUTPUT)
  await appendFile(process.env.GITHUB_OUTPUT, `workspace=${output}\n`)
console.log(`Migration workspace: ${output}`)

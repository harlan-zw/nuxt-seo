import { basename } from 'node:path'

export const siteConfigRef = '235a0808bcc419ab4b7f15be4708e7251bab003d'

export const foundationPackages = [
  { name: 'site-config-stack', version: '5.0.0', directory: 'site/packages/site-config', source: 'site', sourceDirectory: 'packages/site-config' },
  { name: 'nuxt-site-config-kit', version: '5.0.0', directory: 'site/packages/kit', source: 'site', sourceDirectory: 'packages/kit' },
  { name: 'nuxtseo-shared', version: '6.0.0', directory: 'packages/shared', source: 'root', sourceDirectory: 'packages/shared' },
  { name: 'nuxt-site-config', version: '5.0.0', directory: 'site/packages/module', source: 'site', sourceDirectory: 'packages/module' },
  { name: 'nuxtseo-layer-devtools', version: '6.0.0', directory: 'packages/devtools-layer', source: 'root', sourceDirectory: 'packages/devtools-layer' },
  { name: 'nuxtseo-devtools-host', version: '1.0.0', directory: 'packages/devtools-host', source: 'root', sourceDirectory: 'packages/devtools-host' },
] as const

export const releasePackages = ['nuxtseo-shared', 'nuxtseo-layer-devtools', 'nuxtseo-devtools-host'] as const

/** Read the scalar catalog shape used by these repositories. Reject other shapes. */
export function catalogEntries(workspace: string): Map<string, string> {
  const body = workspace.match(/^catalog:\n((?:[ \t].*\n|\n)*)/m)?.[1]
  if (!body)
    throw new Error('The foundation source must define its package catalog.')
  const result = new Map<string, string>()
  for (const line of body.split('\n')) {
    if (!line.trim() || line.trim().startsWith('#'))
      continue
    const entry = line.match(/^ {2}(?:'([^']+)'|"([^"]+)"|([^ :]+)): (.*)$/)
    if (!entry)
      throw new Error(`Unsupported foundation catalog entry: ${line}`)
    const version = entry[4]!.split('#', 1)[0]!.trim()
    if (!version)
      throw new Error(`Unsupported foundation catalog entry: ${line}`)
    result.set(entry[1] || entry[2] || entry[3]!, version)
  }
  return result
}

/** Keep registry and supply-chain configuration, excluding consumer projects. */
export function foundationWorkspace(root: string, site: string): string {
  if (/^(?:<<<<<<<|=======|>>>>>>>)/m.test(root))
    throw new Error('Resolve workspace conflicts before creating the foundation workspace.')
  if (/file:(?:\/|[a-z]:)/i.test(root))
    throw new Error('Foundation policy must not contain absolute file dependencies.')
  const catalog = catalogEntries(root)
  for (const [name, version] of catalogEntries(site)) {
    if (!catalog.has(name))
      catalog.set(name, version)
  }
  let workspace = root.replace(/^packages:\n(?:[ \t].*\n|\n)*/m, '')
    .replace(/^catalog:\n(?:[ \t].*\n|\n)*/m, '')
  if (!/^overrides:\n/m.test(workspace))
    workspace += '\noverrides:\n'
  for (const { name } of foundationPackages) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    workspace = workspace.replace(new RegExp(`^  (?:['"])?${escaped}(?:['"])?:\\s+.*\\n`, 'gm'), '')
    workspace = workspace.replace(/^overrides:\n/m, `overrides:\n  '${name}': workspace:*\n`)
  }
  workspace += `\npackages:\n${foundationPackages.map(pkg => `  - ${pkg.directory}`).join('\n')}\n`
  workspace += `\ncatalog:\n${[...catalog].map(([name, version]) => `  '${name}': ${version}`).join('\n')}\n`
  return workspace
}

export function packageArtifact(name: string, version: string): string {
  return `${basename(name.replaceAll('@', '').replaceAll('/', '-'))}-${version}.tgz`
}

export function assertReleasePackage(name: string): asserts name is typeof releasePackages[number] {
  if (!releasePackages.includes(name as typeof releasePackages[number]))
    throw new Error(`Foundation publication does not permit ${name}.`)
}

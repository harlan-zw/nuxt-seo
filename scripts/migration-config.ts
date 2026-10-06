import { posix } from 'node:path'

export interface MigrationPackage { name: string, version: string, directory: string, pack: boolean }
export interface MigrationSource { id: string, repository: string, ref: string, packages: MigrationPackage[] }
export interface MigrationManifest { sources: MigrationSource[] }

const pkg = (name: string, version: string, directory = '.', pack = true): MigrationPackage => ({ name, version, directory, pack })

export const migrationManifest: MigrationManifest = { sources: [
  { id: 'core', repository: 'harlan-zw/nuxt-seo', ref: '5a92e29163bbede0c64929e603fd3151ec35b92e', packages: [pkg('nuxtseo-shared', '6.0.0', 'packages/shared'), pkg('nuxtseo-layer-devtools', '6.0.0', 'packages/devtools-layer'), pkg('nuxtseo-devtools-host', '1.0.0', 'packages/devtools-host'), pkg('nuxtseo-telemetry', '5.3.16', 'packages/telemetry', false)] },
  { id: 'site', repository: 'harlan-zw/nuxt-site-config', ref: '235a0808bcc419ab4b7f15be4708e7251bab003d', packages: [pkg('site-config-stack', '5.0.0', 'packages/site-config'), pkg('nuxt-site-config-kit', '5.0.0', 'packages/kit'), pkg('nuxt-site-config', '5.0.0', 'packages/module')] },
  { id: 'robots', repository: 'nuxt-modules/robots', ref: '6eea1c784101c3b747e3024a80c92bb837755437', packages: [pkg('@nuxtjs/robots', '7.0.0')] },
  { id: 'sitemap', repository: 'nuxt-modules/sitemap', ref: 'f50ca2da362e4ee5ca5d6b9c21152bde73c05a5d', packages: [pkg('sitemapd', '0.2.2', 'packages/sitemapd', false), pkg('@nuxtjs/sitemap', '9.0.0')] },
  { id: 'og', repository: 'nuxt-modules/og-image', ref: 'dc59e941aa9d996659bc69fc712c5223982774c8', packages: [pkg('nuxt-og-image', '7.0.0')] },
  { id: 'schema', repository: 'harlan-zw/nuxt-schema-org', ref: '187c8f8cbb554df64470282b24c1d07dde2b8177', packages: [pkg('nuxt-schema-org', '7.0.0')] },
  { id: 'utils', repository: 'harlan-zw/nuxt-seo-utils', ref: '037ec41a2cea68adc3f1d028ff94b4122965fea1', packages: [pkg('nuxt-seo-utils', '9.0.0')] },
  { id: 'link', repository: 'harlan-zw/nuxt-link-checker', ref: '681e9bf44fc336a40e18a1131205ff141a93b0b5', packages: [pkg('nuxt-link-checker', '6.0.0')] },
  { id: 'ai', repository: 'harlan-zw/nuxt-ai-ready', ref: '116ed6c2890f027309245d81318b2f167a180bb4', packages: [pkg('nuxt-ai-ready', '3.0.0')] },
  { id: 'skew', repository: 'harlan-zw/nuxt-skew-protection', ref: '908632bbb7c7720b2499a4c272da7a84020b61dd', packages: [pkg('nuxt-skew-protection', '2.0.0')] },
] }

export function parseMigrationManifest(value: unknown): MigrationManifest {
  if (!value || typeof value !== 'object' || !('sources' in value) || !Array.isArray(value.sources))
    throw new Error('Migration sources must contain a source list.')
  const ids = new Set<string>()
  const names = new Set<string>()
  for (const source of value.sources) {
    if (!source || !/^[a-z][a-z0-9-]*$/.test(source.id) || ids.has(source.id) || !/^[\w.-]+\/[\w.-]+$/.test(source.repository) || !/^[a-f0-9]{40}$/.test(source.ref) || !Array.isArray(source.packages))
      throw new Error('Migration sources require unique IDs, repositories, and full commit hashes.')
    ids.add(source.id)
    for (const entry of source.packages) {
      if (!entry || typeof entry.name !== 'string' || names.has(entry.name) || typeof entry.version !== 'string' || typeof entry.pack !== 'boolean' || typeof entry.directory !== 'string' || entry.directory.startsWith('/') || entry.directory.includes('\\') || posix.normalize(entry.directory).startsWith('..'))
        throw new Error('Migration packages require unique identities and relative source directories.')
      names.add(entry.name)
    }
  }
  return value as MigrationManifest
}

function section(yaml: string, name: string): string {
  return yaml.match(new RegExp(`^${name}:\\n((?:[ \\t].*\\n|\\n)*)`, 'm'))?.[1] || ''
}

export function sourceCatalogs(id: string, yaml: string): string {
  let result = ''
  const main = section(yaml, 'catalog')
  if (main)
    result += `  migration-${id}-default:\n${main.split('\n').map(line => line ? `  ${line}` : '').join('\n')}`
  const named = section(yaml, 'catalogs')
  for (const line of named.split('\n')) {
    if (/^ {2}[^ #].*:$/.test(line))
      result += `${line.replace(/^ {2}([^:]+):$/, `  migration-${id}-$1:`)}\n`
    else if (line)
      result += `${line}\n`
  }
  return result
}

export function migrationWorkspace(target: string, sources: { id: string, workspace: string, directories: string[] }[], names: string[]): string {
  if (/^(?:<<<<<<<|=======|>>>>>>>)/m.test(target) || /file:(?:\/|[a-z]:)/i.test(target))
    throw new Error('Migration policy must be resolved and contain no absolute file dependencies.')
  let result = target
  const targetSelectors = section(target, 'packages')
  result = result.replace(/^packages:\n(?:[ \t].*\n|\n)*/m, '')
  result += `\npackages:\n${targetSelectors}${sources.flatMap(source => source.directories.map(directory => `  - '${directory}'`)).join('\n')}\n`
  let catalogs = section(target, 'catalogs')
  result = result.replace(/^catalogs:\n(?:[ \t].*\n|\n)*/m, '')
  for (const source of sources)
    catalogs += sourceCatalogs(source.id, source.workspace)
  if (catalogs)
    result += `\ncatalogs:\n${catalogs}\n`
  let overrides = section(target, 'overrides')
  result = result.replace(/^overrides:\n(?:[ \t].*\n|\n)*/m, '')
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    overrides = overrides.replace(new RegExp(`^  (?:['"])?${escaped}(?:['"])?:\\s+.*\\n`, 'gm'), '')
    overrides += `  '${name}': workspace:*\n`
  }
  result += `\noverrides:\n${overrides}\n`
  return result
}

export function scopeCatalogReferences(manifest: Record<string, unknown>, id: string): void {
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const dependencies = manifest[section]
    if (!dependencies || typeof dependencies !== 'object')
      continue
    for (const [name, value] of Object.entries(dependencies)) {
      if (typeof value === 'string' && value.startsWith('catalog:'))
        (dependencies as Record<string, unknown>)[name] = `catalog:migration-${id}-${value.slice(8) || 'default'}`
    }
  }
}

export function consumerArtifacts(targetId: string, artifacts: { sourceId: string, name: string, path: string }[]): Record<string, string> {
  return Object.fromEntries(artifacts.filter(artifact => targetId === 'core' || artifact.sourceId !== targetId).map(artifact => [artifact.name, artifact.path]))
}

import { existsSync, readFileSync, statSync } from 'node:fs'
// Namespace import on purpose: `findPackageJSON` is experimental (Node 22.14 / 23.2) and missing in Bun,
// where a named import fails to link with "Export named 'findPackageJSON' not found in module 'node:module'".
import * as nodeModule from 'node:module'
import { dirname, isAbsolute, join, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

type FindPackageJSON = (specifier: string | URL, base?: string | URL) => string | undefined

const URL_SCHEME_RE = /^[a-z][a-z\d+.-]*:/i

function moduleNotFound(message: string, cause?: unknown): Error {
  // `require.resolve` throws `MODULE_NOT_FOUND`; normalise to the ESM code native `findPackageJSON` uses.
  return Object.assign(new Error(message, { cause }), { code: 'ERR_MODULE_NOT_FOUND' })
}

function toBaseUrl(base: string | URL): URL {
  if (base instanceof URL)
    return base
  return base.startsWith('file:') ? new URL(base) : pathToFileURL(base)
}

function isBareSpecifier(specifier: string): boolean {
  return !specifier.startsWith('.') && !isAbsolute(specifier) && !URL_SCHEME_RE.test(specifier)
}

function packageName(specifier: string): string {
  const [scope, name] = specifier.split('/')
  return specifier.startsWith('@') ? `${scope}/${name}` : scope!
}

function readName(path: string): string | undefined {
  try {
    const name: unknown = JSON.parse(readFileSync(path, 'utf8')).name
    return typeof name === 'string' ? name : undefined
  }
  catch {
    return undefined
  }
}

function nearestPackageJSON(from: string): string | undefined {
  let dir = from
  while (true) {
    const candidate = join(dir, 'package.json')
    if (existsSync(candidate))
      return candidate
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

/** Walk up from a resolved entry file to the root `package.json` of `name`, skipping nested ones such as `dist/package.json`. */
function packageRootJSON(entry: string, name: string): string | undefined {
  const suffix = `${sep}node_modules${sep}${name.split('/').join(sep)}`
  let nearest: string | undefined
  let dir = dirname(entry)
  while (true) {
    const candidate = join(dir, 'package.json')
    if (existsSync(candidate)) {
      nearest ||= candidate
      if (dir.endsWith(suffix) || readName(candidate) === name)
        return candidate
    }
    const parent = dirname(dir)
    if (parent === dir)
      return nearest
    dir = parent
  }
}

/** Plain `node_modules` lookup, used when the package does not expose a `require`-resolvable entry. */
function lookupNodeModules(name: string, basePath: string): string | undefined {
  let dir = dirname(basePath)
  while (true) {
    const candidate = join(dir, 'node_modules', name, 'package.json')
    if (existsSync(candidate))
      return candidate
    const parent = dirname(dir)
    if (parent === dir)
      return undefined
    dir = parent
  }
}

/**
 * Userland implementation of `module.findPackageJSON()` for runtimes that lack it (Bun, older Node).
 *
 * - Relative, absolute and `file:` specifiers return the nearest `package.json` at or above the resolved path.
 * - Bare specifiers return the root `package.json` of the package. The path may be the symlink-resolved
 *   location, where Node returns the `node_modules` path; both point to the same file.
 *
 * Exported for tests; use {@link findPackageJSON} instead.
 *
 * @internal
 */
export function findPackageJSONFallback(specifier: string | URL, base?: string | URL): string | undefined {
  const id = specifier instanceof URL ? specifier.href : specifier
  if (!isBareSpecifier(id)) {
    if (base === undefined && !isAbsolute(id) && !id.startsWith('file:'))
      throw new TypeError(`A base is required to resolve the relative specifier "${id}".`)
    const url = isAbsolute(id) ? pathToFileURL(id) : new URL(id, base === undefined ? undefined : toBaseUrl(base))
    if (url.protocol !== 'file:')
      throw Object.assign(new TypeError('The URL must be of scheme file'), { code: 'ERR_INVALID_URL_SCHEME' })
    const target = fileURLToPath(url)
    if (!existsSync(target))
      throw moduleNotFound(`Cannot find module '${target}'`)
    return nearestPackageJSON(statSync(target).isDirectory() ? target : dirname(target))
  }
  if (base === undefined)
    throw new TypeError(`A base is required to resolve the bare specifier "${id}".`)
  const basePath = fileURLToPath(toBaseUrl(base))
  const name = packageName(id)
  try {
    return packageRootJSON(nodeModule.createRequire(basePath).resolve(name), name)
  }
  catch (error) {
    const found = lookupNodeModules(name, basePath)
    if (found)
      return found
    throw moduleNotFound(`Cannot find package '${name}' imported from ${basePath}`, error)
  }
}

const nativeFindPackageJSON = (nodeModule as { findPackageJSON?: FindPackageJSON }).findPackageJSON

/**
 * `module.findPackageJSON()` with a fallback for runtimes that do not implement it (Bun).
 *
 * Throws an error with code `ERR_MODULE_NOT_FOUND` when the target cannot be found.
 */
export function findPackageJSON(specifier: string | URL, base?: string | URL): string | undefined {
  return typeof nativeFindPackageJSON === 'function'
    ? nativeFindPackageJSON(specifier, base)
    : findPackageJSONFallback(specifier, base)
}

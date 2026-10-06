import { execFile, spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { assertReleasePackage, foundationPackages, packageArtifact, releasePackages } from './foundation-config.ts'

const directory = process.argv[2]
const selected = process.argv[3]
if (!directory || !selected)
  throw new Error('Use foundation-release.ts ARTIFACT_DIRECTORY all|PACKAGE.')
const names = selected === 'all' ? releasePackages : [selected]
// Validate the complete plan before publishing any package.
for (const name of names)
  assertReleasePackage(name)
const artifacts = names.map((name) => {
  const pkg = foundationPackages.find(pkg => pkg.name === name)!
  return { pkg, file: join(resolve(directory), packageArtifact(pkg.name, pkg.version)) }
})
for (const { pkg, file } of artifacts) {
  await readFile(file)
  const { stdout } = await promisify(execFile)('tar', ['-xOf', file, 'package/package.json'])
  const manifest = JSON.parse(stdout)
  if (manifest.name !== pkg.name || manifest.version !== pkg.version)
    throw new Error(`Unexpected foundation archive identity: ${file}.`)
}
for (const { file } of artifacts) {
  await new Promise<void>((resolve, reject) => {
    const process = spawn('pnpm', ['publish', file, '--access', 'public', '--provenance', '--no-git-checks'], { stdio: 'inherit' })
    process.once('error', reject)
    process.once('exit', code => code === 0 ? resolve() : reject(new Error(`Foundation publication failed with status ${code}.`)))
  })
}

#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import process from 'node:process'

const HOME_RE = /^~/
const ROOT = dirname(new URL(import.meta.url).pathname)
const WORKFLOWS_DIR = resolve(ROOT, 'workflows')

// Module repos relative to ~/pkg
const MODULES = [
  { path: '~/pkg/nuxt-robots' },
  { path: '~/pkg/sitemap' },
  { path: '~/pkg/og-image', monorepo: true },
  { path: '~/pkg/nuxt-schema-org' },
  { path: '~/pkg/nuxt-seo-utils' },
  { path: '~/pkg/nuxt-link-checker' },
  { path: '~/pkg/nuxt-site-config', monorepo: true },
]

// Files that are identical across all modules (synced as-is)
const SHARED_FILES = ['test.yml', 'nightly.yml', 'deploy-docs.yml']

// Release template, `{{MONOREPO_WITH}}` is replaced per module
const RELEASE_TEMPLATE = `name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    permissions:
      contents: write
      id-token: write
    uses: harlan-zw/nuxt-seo/.github/workflows/reusable-release.yml@main{{MONOREPO_WITH}}
`

function expandHome(p) {
  return p.replace(HOME_RE, process.env.HOME)
}

function syncModule(mod) {
  const target = expandHome(mod.path)
  const targetWorkflows = resolve(target, '.github', 'workflows')

  if (!existsSync(target)) {
    console.log(`  skipping ${mod.path} (not found)`)
    return
  }

  mkdirSync(targetWorkflows, { recursive: true })

  // Sync shared files
  for (const file of SHARED_FILES) {
    const src = resolve(WORKFLOWS_DIR, file)
    if (!existsSync(src)) {
      console.log(`  skipping ${file} (source not found)`)
      continue
    }
    const content = readFileSync(src, 'utf-8')
    writeFileSync(resolve(targetWorkflows, file), content)
    console.log(`  ${file}`)
  }

  // Generate release.yml
  const monorepoWith = mod.monorepo
    ? '\n    with:\n      monorepo: true'
    : ''
  const releaseContent = RELEASE_TEMPLATE.replace('{{MONOREPO_WITH}}', monorepoWith)
  writeFileSync(resolve(targetWorkflows, 'release.yml'), releaseContent)
  console.log(`  release.yml${mod.monorepo ? ' (monorepo)' : ''}`)
}

// Shared workflow files that get copied to modules (not the reusable-* ones)
// We need to create these canonical files in .github/workflows/ if they don't exist as sync sources
const sharedSources = SHARED_FILES.map(f => resolve(WORKFLOWS_DIR, f))
const missing = sharedSources.filter(f => !existsSync(f))
if (missing.length) {
  console.error('Missing source workflow files:', missing)
  process.exit(1)
}

console.log('Syncing workflows to modules...\n')

for (const mod of MODULES) {
  console.log(mod.path)
  syncModule(mod)
  console.log('')
}

// Show git status for each module
console.log('Changes:')
for (const mod of MODULES) {
  const target = expandHome(mod.path)
  if (!existsSync(target))
    continue
  const status = execSync('git diff --stat .github/workflows/', { cwd: target, encoding: 'utf-8' }).trim()
  if (status) {
    console.log(`  ${mod.path}:`)
    console.log(`    ${status.split('\n').join('\n    ')}`)
  }
  else {
    console.log(`  ${mod.path}: up to date`)
  }
}

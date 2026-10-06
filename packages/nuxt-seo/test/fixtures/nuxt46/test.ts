import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'

type Case = 'enabled' | 'overrides' | 'modules-disabled' | 'bundle-disabled' | 'enabled-false' | 'explicit'
const cases: Case[] = ['enabled', 'overrides', 'modules-disabled', 'bundle-disabled', 'enabled-false', 'explicit']
const selected = process.env.NUXT_TEST_CASES?.split(',')
if (selected?.some(value => !cases.includes(value as Case)))
  throw new Error('Unknown packed consumer case.')

function run(args: string[], mode: Case): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd: import.meta.dirname,
      env: { ...process.env, NUXT_TEST_CASE: mode },
      stdio: 'inherit',
    })
    child.once('error', reject)
    child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`Packed build failed: ${signal || code}`)))
  })
}

async function freePort(): Promise<number> {
  const socket = createServer()
  socket.listen(0, '127.0.0.1')
  await once(socket, 'listening')
  const address = socket.address()
  if (!address || typeof address === 'string')
    throw new Error('Could not allocate a test port.')
  socket.close()
  await once(socket, 'close')
  return address.port
}

for (const mode of selected ? selected as Case[] : cases) {
  const enabled = mode === 'enabled' || mode === 'overrides'
  const override = mode === 'overrides'
  const origin = override ? 'https://override.example.com' : 'https://combined.example.com'
  const aliasesEnabled = mode === 'enabled'
  const standalone = process.env.NUXT_TEST_STANDALONE !== '0'
  const aliasScript = aliasesEnabled ? `import { useSiteConfig, withSiteUrl } from '#site-config/app'
import { useRobotsRule } from '#robots/app'
import { defineOgImage } from '#og-image/app'
import { defineWebPage, useSchemaOrg } from '#schema-org/app'
import { useFallbackTitle } from '#seo-utils/app'
import { isNonFetchableLink } from '#link-checker/app'
const aliasSite = useSiteConfig()
const aliasUrl = withSiteUrl('/alias-proof')
const aliasRule = useRobotsRule()
const aliasTitle = useFallbackTitle()
const aliasLink = isNonFetchableLink('mailto:fixture@example.com')
useSchemaOrg([defineWebPage({ name: 'Typed aliases' })])
defineOgImage('Default', { title: 'Combined SEO' })
` : ''
  const script = `import { useSeoMeta } from 'nuxt/app'\nuseSeoMeta({ title: 'Combined fixture', description: 'Packed SEO integration' })\n${aliasScript}`
  const aliasMarkup = aliasesEnabled ? '<p>{{ aliasSite.name }} {{ aliasUrl }} {{ aliasRule }} {{ aliasTitle }} {{ aliasLink }}</p>' : ''
  await writeFile(new URL('app/pages/index.vue', import.meta.url), `<script setup lang="ts">\n${script}</script>\n\n<template>\n  <main>\n    <h1>Combined fixture</h1>\n    ${aliasMarkup}\n    <NuxtLink to="/missing">Broken local link</NuxtLink>\n    <NuxtLink to="/Target">Valid uppercase target</NuxtLink>\n  </main>\n</template>\n`)
  const aliasRoute = new URL('server/api/runtime-alias.get.ts', import.meta.url)
  if (aliasesEnabled) {
    await writeFile(aliasRoute, `import { defineEventHandler } from 'nuxt/server'
import { getSiteConfig, withSiteUrl } from '#site-config/server'
import { getPathRobotConfig } from '#robots/server'
import { asSitemapUrl } from '#sitemap/server'
import { getOgImageUrl } from '#og-image/server'
import { useSchemaOrgConfig } from '#schema-org/server'
${standalone ? "import { countPages } from '#ai-ready/server'\n" : ''}
export default defineEventHandler(async event => ({
  site: getSiteConfig(event).name,
  sitemap: asSitemapUrl({ loc: withSiteUrl(event, '/alias-proof') }),
  robots: getPathRobotConfig(event, { path: '/' }).indexable,
  image: getOgImageUrl(event, '/'),
  schemaVersion: useSchemaOrgConfig().version,
  count: ${standalone ? 'await countPages(event)' : 'null'},
}))
`)
  }
  else {
    await rm(aliasRoute, { force: true })
  }
  console.log(`Packed combined case: ${mode}, Node ${process.version}`)
  await run(['exec', 'nuxt', 'cleanup'], mode)
  await run(['exec', 'nuxt', 'prepare'], mode)
  await run(['exec', 'vue-tsc', '--noEmit', '-p', '.nuxt/tsconfig.app.json'], mode)
  await run(['exec', 'vue-tsc', '--noEmit', '-p', '.nuxt/tsconfig.server.json'], mode)
  await run(['exec', 'nuxt', 'build'], mode)
  const manifest = JSON.parse(await readFile(new URL('.output/nitro.json', import.meta.url), 'utf8'))
  assert.match(manifest.versions.nitro, process.env.NUXT_TEST_LANE === 'nuxt5' ? /^3\./ : /^2\./)
  const port = await freePort()
  const local = `http://127.0.0.1:${port}`
  const server = spawn(process.execPath, ['.output/server/index.mjs'], {
    cwd: import.meta.dirname,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NITRO_HOST: '127.0.0.1', NITRO_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'inherit'],
  })
  let output = ''
  server.stdout.setEncoding('utf8')
  server.stdout.on('data', chunk => output += chunk)
  try {
    for (let attempt = 0; !/Listening on/.test(output); attempt++) {
      if (attempt > 100 || server.exitCode !== null)
        throw new Error('Packed server did not start.')
      await delay(50)
    }
    const ready = await fetch(`${local}/api/ready`).then(response => response.json())
    assert.equal(ready.mode, mode)
    const page = await fetch(local)
    assert.equal(page.status, 200)
    const html = await page.text()
    if (enabled) {
      for (const name of ['@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-og-image', 'nuxt-link-checker', 'nuxt-seo-utils', 'nuxt-site-config', 'nuxt-schema-org']) {
        if (override && ['nuxt-og-image', 'nuxt-schema-org', 'nuxt-link-checker'].includes(name))
          continue
        assert.ok(ready.modules.includes(name), `Missing enabled producer: ${name}`)
      }
      assert.match(html, new RegExp(`<title>Combined fixture \\| ${override ? 'User Override' : 'Combined SEO'}<\\/title>`))
      assert.ok(html.includes(`rel="canonical" href="${origin}/"`), 'Site Config and SEO Utils did not emit the canonical origin.')
      const robots = await fetch(`${local}/robots.txt`)
      assert.equal(robots.status, 200)
      const robotsText = await robots.text()
      assert.match(robotsText, /User-agent: \*/)
      assert.ok(robotsText.includes(`${origin}/sitemap.xml`))
      const sitemap = await fetch(`${local}/sitemap.xml`)
      assert.equal(sitemap.status, 200)
      const xml = await sitemap.text()
      assert.ok(xml.includes(`<loc>${origin}/</loc>`))
      if (override) {
        assert.match(robotsText, /Disallow: \/blocked/)
        assert.ok(xml.includes(`${origin}/custom`))
        assert.ok(!xml.includes(`${origin}/about`))
        assert.doesNotMatch(html, /application\/ld\+json|property="og:image"/)
      }
      else {
        assert.ok(html.includes(`${origin}/alias-proof`))
        const aliases = await fetch(`${local}/api/runtime-alias`).then(response => response.json())
        assert.equal(aliases.site, 'Combined SEO')
        assert.deepEqual(aliases.sitemap, { loc: `${origin}/alias-proof` })
        assert.equal(aliases.robots, true)
        assert.ok(aliases.image.startsWith(`${origin}/__og-image__/`))
        if (process.env.NUXT_TEST_STANDALONE !== '0')
          assert.ok(aliases.count > 0, 'AI Ready canonical server alias must query indexed SQLite pages.')
        assert.match(html, /application\/ld\+json/)
        assert.match(html, /"@type":"WebSite"/)
        const imageUrl = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1]
        assert.ok(imageUrl, 'OG Image did not emit metadata.')
        const url = new URL(imageUrl.replaceAll('&amp;', '&'))
        const image = await fetch(`${local}${url.pathname}${url.search}`)
        assert.equal(image.status, 200)
        assert.equal(image.headers.get('content-type'), 'image/png')
        const bytes = Buffer.from(await image.arrayBuffer())
        assert.ok(bytes.byteLength > 1000)
        assert.equal(bytes.subarray(1, 4).toString(), 'PNG')
        const reportResponse = await fetch(`${local}/__link-checker__/link-checker-report.json`)
        assert.equal(reportResponse.status, 200)
        const report = await reportResponse.json()
        assert.ok(report.flatMap((entry: { reports: Array<{ link: string, error: unknown[] }> }) => entry.reports)
          .some((entry: { link: string, error: unknown[] }) => entry.link === '/missing' && entry.error.length > 0))
      }
      if (process.env.NUXT_TEST_STANDALONE !== '0') {
        const prerenderedMarkdown = await readFile(new URL('.output/public/index.md', import.meta.url), 'utf8')
        assert.match(prerenderedMarkdown, /# Combined fixture/)
        const markdown = await fetch(`${local}/index.md`)
        assert.equal(markdown.status, 200)
        assert.match(await markdown.text(), /# Combined fixture/)
        const llms = await fetch(`${local}/llms.txt`)
        assert.equal(llms.status, 200)
        assert.ok((await llms.text()).includes(origin))
        const health = await fetch(`${local}/__skew/health`).then(response => response.json())
        assert.equal(health.ok, true)
        assert.equal(typeof health.version, 'string')
        const navigation = await fetch(`${local}/about`, { headers: { 'sec-fetch-dest': 'document' } })
        assert.match(navigation.headers.get('set-cookie') || '', /__nkpv=/)
      }
    }
    else {
      assert.doesNotMatch(html, /application\/ld\+json|property="og:image"|rel="canonical"/)
      assert.equal(page.headers.get('x-robots-tag'), mode === 'explicit' ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' : null)
      assert.equal((await fetch(`${local}/robots.txt`)).status, mode === 'explicit' ? 200 : 404)
      assert.equal((await fetch(`${local}/sitemap.xml`)).status, 404)
      if (mode === 'bundle-disabled' || mode === 'enabled-false')
        assert.ok(!ready.modules.some((name: string) => ['@nuxtjs/robots', '@nuxtjs/sitemap', 'nuxt-og-image'].includes(name)))
    }
    console.log(`Passed packed combined case: ${mode}, Node ${process.version}`)
  }
  finally {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit')
      server.kill('SIGTERM')
      await exited
    }
  }
}

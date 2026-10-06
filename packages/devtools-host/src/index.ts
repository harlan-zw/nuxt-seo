import type { Resolver } from '@nuxt/kit'
import type { BirpcGroup } from 'birpc'
import type { Nuxt } from 'nuxt/schema'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire, findPackageJSON } from 'node:module'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
import { modules as seoModules } from 'nuxtseo-shared/const'
import { detectNuxtSeoModules } from 'nuxtseo-shared/kit'
import sirv from 'sirv'

/** Resolve a module's npm package name from its devtools slug. */
function npmForSlug(slug: string): string | undefined {
  return seoModules.find(m => m.slug === slug)?.npm
}

export type { BirpcGroup } from 'birpc'

/** Origin-root route the assembled (layer-mode) devtools client is served from. */
export const UNIFIED_CLIENT_ROUTE = '/__nuxt-seo-devtools'

const CACHE_PROTOCOL = 1

export interface DevToolsUIConfig {
  /** Per-module route used by the legacy prebuilt-client mode. */
  route?: string
  name: string
  title: string
  icon: string
  /** Route segment inside the unified client (layer mode). Defaults to name minus `nuxt-`. */
  slug?: string
  /** Legacy dev-proxy port (prebuilt-client mode only). */
  devPort?: number
}

export interface SeoModuleInfo {
  name: string
  /** npm package name — the stable identifier the client matches installed state on. */
  npm?: string
  title: string
  icon: string
  route: string
}

interface SeoDevtoolsEntry {
  slug: string
  name: string
  title: string
  icon: string
  layerDir: string
}

function packageVersion(base: string | URL): string {
  const manifest = findPackageJSON('./', base)
  if (!manifest)
    throw new Error('Cannot resolve the DevTools package version.')
  return JSON.parse(readFileSync(manifest, 'utf8')).version
}

function cacheKey(installed: SeoDevtoolsEntry[]): string {
  const baseLayer = resolveBaseLayer()
  const coreManifest = findPackageJSON('nuxtseo-shared', import.meta.url)
  if (!coreManifest)
    throw new Error('Cannot resolve the shared DevTools package version.')
  const hash = createHash('sha256')
  hash.update(JSON.stringify({ protocol: CACHE_PROTOCOL, host: packageVersion(import.meta.url), core: JSON.parse(readFileSync(coreManifest, 'utf8')).version, ui: packageVersion(pathToFileURL(join(baseLayer, 'nuxt.config.ts'))) }))
  function includeLayer(dir: string, prefix = ''): void {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules')
        continue
      const path = join(dir, entry.name)
      const relative = join(prefix, entry.name)
      if (entry.isDirectory()) {
        includeLayer(path, relative)
      }
      else if (entry.isFile()) {
        const content = readFileSync(path)
        hash.update(JSON.stringify([relative, content.length]))
        hash.update(content)
      }
    }
  }
  includeLayer(baseLayer)
  for (const entry of [...installed].sort((a, b) => a.slug.localeCompare(b.slug))) {
    hash.update(JSON.stringify({ ...entry, version: packageVersion(pathToFileURL(join(entry.layerDir, 'nuxt.config.ts'))) }))
    includeLayer(entry.layerDir)
  }
  return hash.digest('hex')
}

function placeholderHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Nuxt SEO DevTools</title>
<style>html,body{margin:0;height:100%;font-family:'Hubot Sans',system-ui,sans-serif;background:oklch(98.4% 0.005 292);color:oklch(16% 0.036 292)}@media(prefers-color-scheme:dark){html,body{background:oklch(11% 0.029 292);color:oklch(96.8% 0.009 292)}}.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}.spin{width:34px;height:34px;border-radius:50%;border:3px solid color-mix(in oklab,oklch(54% 0.225 292) 25%,transparent);border-top-color:oklch(54% 0.225 292);animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}h1{font-size:15px;font-weight:600;margin:0}p{font-size:13px;opacity:.6;margin:0;max-width:440px}.mods{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:420px}.chip{font-size:11px;padding:2px 9px;border-radius:999px;background:color-mix(in oklab,oklch(54% 0.225 292) 14%,transparent);color:oklch(54% 0.225 292)}.btn{font:inherit;font-size:13px;font-weight:600;padding:7px 16px;border-radius:8px;border:0;background:oklch(54% 0.225 292);color:#fff;cursor:pointer}.btn:hover{background:oklch(49% 0.225 292)}.btn:disabled{opacity:.6;cursor:default}.hide{display:none}.step{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;opacity:.55;max-width:520px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:16px}.t{font-variant-numeric:tabular-nums;opacity:.85}.err .spin{border-top-color:oklch(60% 0.2 25);border-color:color-mix(in oklab,oklch(60% 0.2 25) 25%,transparent);animation:none}</style></head>
<body><div class="wrap" id="wrap"><div class="spin" id="spin"></div><h1 id="title">Nuxt SEO DevTools</h1><div class="mods" id="mods"></div><p id="desc">Starting…</p><button class="btn hide" id="retry">Retry</button><div class="step" id="step"></div></div>
<script>
const $=id=>document.getElementById(id)
const esc=s=>(s||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
let mods=false
$('retry').addEventListener('click',async()=>{
  $('retry').disabled=true
  try{
    const response=await fetch('${UNIFIED_CLIENT_ROUTE}/__retry',{method:'POST'})
    if(!response.ok) throw new Error('Build retry failed.')
    $('wrap').classList.remove('err')
    await poll()
  }catch(error){$('step').textContent=error.message;$('retry').disabled=false}
})
async function poll(){
  try{
    const response=await fetch('${UNIFIED_CLIENT_ROUTE}/__status')
    if(!response.ok) throw new Error('Cannot read the DevTools build status.')
    const j=await response.json()
    if(j.ready){location.reload();return}
    if(!mods&&Array.isArray(j.modules)&&j.modules.length){mods=true;$('mods').innerHTML=j.modules.map(m=>'<span class="chip">'+esc(m)+'</span>').join('')}
    $('retry').classList.toggle('hide',!j.failed)
    $('retry').disabled=false
    $('wrap').classList.toggle('err',j.failed)
    $('title').textContent=j.failed?'DevTools unavailable':'Building Nuxt SEO DevTools…'
    $('desc').textContent=j.failed?'Check the dev server logs, then retry.':'Assembling panels for your installed modules.'
    const t=j.elapsed?' · <span class="t">'+Math.round(j.elapsed/1000)+'s</span>':''
    $('step').innerHTML=esc(j.step)+t
  }catch(error){$('step').textContent=error.message}
}
setInterval(poll,800);poll()
</script></body></html>`
}

function deriveRoutes(layerDir: string, slug: string): string[] {
  const routes = [`/${slug}`]
  const pagesDir = join(layerDir, 'pages', slug)
  if (existsSync(pagesDir)) {
    for (const f of readdirSync(pagesDir)) {
      if (f.endsWith('.vue') && f !== 'index.vue')
        routes.push(`/${slug}/${f.slice(0, -4)}`)
    }
  }
  return routes
}

/** Register the shared `getInstalledSeoModules` RPC once (drives the module switcher). */
function registerSharedRpcOnce(nuxt: Nuxt): void {
  if ((nuxt as any)._seoDevtoolsRpcRegistered)
    return
  (nuxt as any)._seoDevtoolsRpcRegistered = true
  onDevToolsInitialized(() => {
    extendServerRpc('nuxt-seo-modules', {
      // Registered modules (those that shipped a devtools panel) carry the iframe route.
      // detectNuxtSeoModules adds every *installed* SEO module from nuxt's module list —
      // independent of whether it self-registered a panel or which shared version it ships —
      // so the picker reflects the full install (e.g. site-config, which has no panel).
      getInstalledSeoModules: (): SeoModuleInfo[] => {
        const byNpm = new Map<string, SeoModuleInfo>()
        for (const m of ((nuxt as any)._seoDevtoolsModules || []) as SeoModuleInfo[]) {
          if (m.npm)
            byNpm.set(m.npm, m)
        }
        for (const det of detectNuxtSeoModules(nuxt)) {
          if (!byNpm.has(det.name)) {
            const meta = seoModules.find(s => s.npm === det.name)
            byNpm.set(det.name, { name: meta?.slug ?? det.name, npm: det.name, title: meta?.label ?? det.name, icon: meta?.icon ?? '', route: '' })
          }
        }
        return [...byNpm.values()]
      },
    }, nuxt)
  }, nuxt)
}

/**
 * Resolve the base devtools layer to an absolute path from a module's own dependency
 * context. A bare `extends: ['nuxtseo-layer-devtools']` only resolves when the user's
 * app installs the layer directly — with pnpm's isolated layout, a module's transitive
 * dep never lands in the app root node_modules, so the assembled client must extend an
 * absolute path instead.
 */
function resolveBaseLayer(): string {
  return dirname(createRequire(import.meta.url).resolve('nuxtseo-layer-devtools'))
}

/**
 * Resolve the Nuxt CLI entry so we can run the build with the current Node executable.
 * Relying on a bare `npx` spawn fails with ENOENT in any dev server whose process PATH
 * doesn't include npx (IDE-launched servers, some Node version managers, certain pnpm
 * layouts), and Nuxt 4 dropped the standalone `nuxi` package entirely (the `nuxi`/`nuxt`
 * bins now live in `nuxt` and `@nuxt/cli`), so `npx nuxi` would try to fetch a stale
 * package.
 *
 * We resolve relative to `process.argv[1]` first — that's the CLI entry the running dev
 * server was launched from, so it pins the build to the exact same Nuxt/CLI install —
 * then fall back to the project root. Each `bin/nuxt.mjs` / `bin/nuxi.mjs` dispatcher
 * accepts the `build` subcommand. Returns null when nothing resolves.
 */
function resolveNuxtCli(rootDir: string): string | null {
  const bases = [process.argv[1], join(rootDir, 'index.js')].filter(Boolean) as string[]
  for (const base of bases) {
    let req: NodeRequire
    try {
      req = createRequire(base)
    }
    catch {
      continue
    }
    for (const spec of ['nuxi', 'nuxt', '@nuxt/cli']) {
      try {
        const pkgPath = req.resolve(`${spec}/package.json`)
        const bin = JSON.parse(readFileSync(pkgPath, 'utf8')).bin
        const rel = typeof bin === 'string' ? bin : (bin?.nuxi ?? bin?.nuxt)
        if (rel)
          return join(dirname(pkgPath), rel)
      }
      catch {
        // expected when this CLI package isn't reachable from this base — keep trying
      }
    }
  }
  return null
}

/** Strip ANSI colour codes so a build log line is readable in the placeholder UI. */
const stripAnsi = (s: string): string => s.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'), '')

interface BuildHooks {
  onChild: (child: ReturnType<typeof spawn>) => void
  /** Latest human-readable build step (most recent consola/Nuxt status line). */
  onProgress: (step: string) => void
  onReady: () => void
  onError: (message?: string) => void
}

function generateAndBuild(cacheDir: string, rootDir: string, installed: SeoDevtoolsEntry[], key: string, hooks: BuildHooks): void {
  const routes = ['/', ...installed.flatMap(m => deriveRoutes(m.layerDir, m.slug))]
  const extendsList = [resolveBaseLayer(), ...installed.map(m => m.layerDir)]
  rmSync(join(cacheDir, 'dist'), { recursive: true, force: true })
  mkdirSync(join(cacheDir, 'pages'), { recursive: true })
  writeFileSync(join(cacheDir, 'package.json'), JSON.stringify({ name: 'nuxt-seo-devtools-client', private: true, type: 'module' }))
  writeFileSync(join(cacheDir, 'nuxt.config.ts'), `export default defineNuxtConfig({
  extends: ${JSON.stringify(extendsList, null, 2)},
  ssr: false,
  robots: false,
  content: false,
  sitemap: false,
  nitro: { prerender: { routes: ${JSON.stringify(routes)} }, output: { publicDir: ${JSON.stringify(join(cacheDir, 'dist/devtools'))} } },
  app: { baseURL: '${UNIFIED_CLIENT_ROUTE}/' },
  compatibilityDate: '2026-03-13',
})
`)
  writeFileSync(join(cacheDir, 'app.vue'), `<template><NuxtPage /></template>\n`)
  writeFileSync(join(cacheDir, 'pages/index.vue'), `<template><div class="p-4">${installed.map(m => `<NuxtLink to="/${m.slug}" class="block underline">${m.title}</NuxtLink>`).join('')}</div></template>\n`)

  // eslint-disable-next-line no-console
  console.log(`[nuxt-seo] building devtools client for: ${installed.map(m => m.slug).join(', ')}`)
  const cliBin = resolveNuxtCli(rootDir)
  // Pipe stdout/stderr (instead of inherit) so we can surface the latest build step to
  // the panel's placeholder, while still forwarding the raw output to the dev terminal.
  if (!cliBin) {
    hooks.onError('Cannot resolve the Nuxt CLI from this project.')
    return
  }
  const child = spawn(process.execPath, [cliBin, 'build'], { cwd: cacheDir, stdio: ['inherit', 'pipe', 'pipe'] })
  hooks.onChild(child)
  // Match consola/Nuxt status lines (leading glyph like ℹ ✔ ✨ ⚠ ✖ ● ➜, or a `[scope]`
  // tag such as `[nitro]`). Whitelisting these keeps the surfaced step readable and skips
  // the code-frames, carets and box-drawing the build tooling interleaves.
  const statusLine = /^(?:[ℹ✔✓✨⚠✖✗●➜√]|\[\w)/
  // Buffer the raw build output instead of streaming it to the dev terminal: only the
  // latest step is shown (surfaced to the panel via onProgress and echoed as a single
  // `[nuxt-seo]` line), and the full log is dumped only if the build fails (see the exit
  // handler), keeping the dev terminal quiet.
  const buffered: Buffer[] = []
  let drawing = false
  const capture = (chunk: Buffer): void => {
    buffered.push(chunk)
    const step = stripAnsi(chunk.toString())
      .split('\n')
      .map(l => l.trim())
      .filter(l => statusLine.test(l))
      .pop()
    if (step) {
      hooks.onProgress(step)
      // Redraw the step in place (carriage return + clear-to-end) so the dev terminal
      // shows a single updating line instead of one line per build step.
      process.stdout.write(`\r\x1B[2K[nuxt-seo] ${step}`)
      drawing = true
    }
  }
  // Terminate the in-place line so subsequent logs start on a fresh line.
  const endLine = (): void => {
    if (drawing) {
      process.stdout.write('\n')
      drawing = false
    }
  }
  child.stdout?.on('data', capture)
  child.stderr?.on('data', capture)
  // Surface spawn failures in the panel so the developer can retry.
  child.on('error', (err) => {
    endLine()
    console.error(`[nuxt-seo] could not build devtools client, the panel will stay unavailable: ${err.message}`)
    hooks.onError(err.message)
  })
  child.on('exit', (code) => {
    endLine()
    if (code === 0 && (existsSync(join(cacheDir, 'dist/devtools/index.html')) || existsSync(join(cacheDir, 'dist/devtools/200.html')))) {
      writeFileSync(join(cacheDir, '.installed-hash'), key)
      hooks.onReady()
      // eslint-disable-next-line no-console
      console.log('[nuxt-seo] devtools client ready')
    }
    else {
      // Dump the buffered build output so the failure is actually debuggable.
      process.stderr.write(Buffer.concat(buffered))
      console.error(`[nuxt-seo] devtools client build exited with code ${code}, the panel will stay unavailable`)
      hooks.onError(code === 0 ? 'The DevTools build produced no page.' : `DevTools build failed with exit code ${code}.`)
    }
  })
}

/**
 * Layer mode (current): the module ships its devtools as a source layer. All such
 * modules are assembled into ONE client built in the user's project (async, behind a
 * Building… placeholder) and served at `/__nuxt-seo-devtools/<slug>`.
 */
function setupLayerModule(config: DevToolsUIConfig, layerDir: string, nuxt: Nuxt): void {
  const slug = config.slug ?? config.name.replace(/^nuxt-/, '')
  const clientRoute = `${UNIFIED_CLIENT_ROUTE}/${slug}`

  const modules: SeoModuleInfo[] = (nuxt as any)._seoDevtoolsModules ??= []
  modules.push({ name: config.name, npm: npmForSlug(slug), title: config.title, icon: config.icon, route: clientRoute })

  const layers: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers ??= []
  layers.push({ slug, name: config.name, title: config.title, icon: config.icon, layerDir })

  addCustomTab({ name: `nuxt-seo-${slug}`, title: config.title, icon: config.icon, view: { type: 'iframe', src: clientRoute } }, nuxt)

  if ((nuxt as any)._seoDevtoolsInit)
    return
  (nuxt as any)._seoDevtoolsInit = true

  const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/nuxt-seo-devtools')
  const dist = join(cacheDir, 'dist/devtools')
  type State = { _tag: 'Idle' } | { _tag: 'Building', startedAt: number, step: string } | { _tag: 'Ready' } | { _tag: 'Failed', message: string }
  let state: State = { _tag: 'Idle' }
  let closed = false
  const rootDir = nuxt.options.rootDir
  nuxt.hook('close', () => {
    closed = true
  })

  function ensureBuilt(): void {
    if (closed || state._tag === 'Ready' || state._tag === 'Building')
      return
    state = { _tag: 'Building', startedAt: Date.now(), step: 'Starting build…' }
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers
    try {
      generateAndBuild(cacheDir, rootDir, installed, cacheKey(installed), {
        onChild: (child) => {
          const unhook = nuxt.hook('close', () => {
            child.kill()
          })
          child.once('close', unhook)
        },
        onProgress: (step) => {
          if (state._tag === 'Building')
            state.step = step
        },
        onReady: () => { state = { _tag: 'Ready' } },
        onError: (message) => { state = { _tag: 'Failed', message: message ?? 'Build failed, see the dev server logs' } },
      })
    }
    catch (error) {
      state = { _tag: 'Failed', message: error instanceof Error ? error.message : String(error) }
    }
  }

  nuxt.hook('modules:done', () => {
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers
    try {
      const key = cacheKey(installed)
      if (existsSync(join(cacheDir, '.installed-hash')) && readFileSync(join(cacheDir, '.installed-hash'), 'utf8') === key && (existsSync(join(dist, 'index.html')) || existsSync(join(dist, '200.html'))))
        state = { _tag: 'Ready' }
    }
    catch (error) {
      state = { _tag: 'Failed', message: error instanceof Error ? error.message : String(error) }
    }
  })

  nuxt.hook('vite:serverCreated', (server) => {
    const serve = sirv(dist, { dev: true, single: '200.html' })
    server.middlewares.use(UNIFIED_CLIENT_ROUTE, (req, res, next) => {
      const url = req.url || '/'
      if (url.startsWith('/__install')) {
        res.statusCode = 405
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({ error: 'Use the DevTools install action.' }))
      }
      if (url.startsWith('/__retry')) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        const origin = req.headers.origin
        if (origin && (!URL.canParse(origin) || new URL(origin).host !== req.headers.host)) {
          res.statusCode = 403
          return res.end()
        }
        if (state._tag === 'Failed')
          ensureBuilt()
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({ accepted: state._tag === 'Building' || state._tag === 'Ready' }))
      }
      if (url.startsWith('/__status')) {
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({
          ready: state._tag === 'Ready',
          failed: state._tag === 'Failed',
          step: state._tag === 'Building' ? state.step : state._tag === 'Failed' ? state.message : '',
          modules: ((nuxt as any)._seoDevtoolsLayers as SeoDevtoolsEntry[]).map(m => m.title),
          elapsed: state._tag === 'Building' ? Date.now() - state.startedAt : 0,
        }))
      }
      if (state._tag === 'Idle')
        ensureBuilt()
      if (state._tag !== 'Ready') {
        res.setHeader('content-type', 'text/html')
        return res.end(placeholderHtml())
      }
      return serve(req, res, next)
    })
  })
}

/**
 * Register a module's devtools panel. Detects whether the module ships a source layer
 * (current) or a prebuilt client (legacy) and handles each, so old and new modules can
 * be mixed during migration.
 */
export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  if (!nuxt.options.dev || nuxt.options.devtools === false || (typeof nuxt.options.devtools === 'object' && nuxt.options.devtools.enabled === false))
    return

  // Published packages ship the layer at `<dist>/devtools`, but when a module runs from
  // source in dev (playground importing `../src/module`) it lives at `<root>/devtools`.
  // Prefer the dist-relative path, fall back to the source-relative one.
  const layerFallback = resolve('./devtools')
  const layerCandidates = [layerFallback, resolve('../devtools')]
  const layerDir = layerCandidates.find(dir => existsSync(join(dir, 'nuxt.config.ts'))) ?? layerFallback
  const isLayer = existsSync(join(layerDir, 'nuxt.config.ts')) && !existsSync(join(layerDir, 'index.html'))

  registerSharedRpcOnce(nuxt)

  if (isLayer)
    setupLayerModule(config, layerDir, nuxt)
  else
    console.warn(`[nuxt-seo] Cannot resolve the DevTools panel for ${config.name}.`)
}

export function setupDevToolsRpc<
  ServerFunctions extends object,
  ClientFunctions extends object,
>(
  namespace: string,
  serverFunctions: ServerFunctions,
  nuxt: Nuxt = useNuxt(),
): Promise<BirpcGroup<ClientFunctions, ServerFunctions> | undefined> {
  if (!nuxt.options.dev || nuxt.options.devtools === false || (typeof nuxt.options.devtools === 'object' && nuxt.options.devtools.enabled === false))
    return Promise.resolve(undefined)
  return new Promise((resolve) => {
    onDevToolsInitialized(() => {
      resolve(extendServerRpc<ClientFunctions, ServerFunctions>(namespace, serverFunctions, nuxt))
    }, nuxt)
  })
}

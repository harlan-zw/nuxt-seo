import type { Resolver } from '@nuxt/kit'
import type { BirpcGroup } from 'birpc'
import type { Nuxt } from 'nuxt/schema'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { addCustomTab, extendServerRpc, onDevToolsInitialized, startSubprocess } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
import { detectPackageManager } from 'nypm'
import sirv from 'sirv'
import { modules as seoModules } from './const'
import { detectNuxtSeoModules } from './kit'

/** Resolve a module's npm package name from its devtools slug. */
function npmForSlug(slug: string): string | undefined {
  return seoModules.find(m => m.slug === slug)?.npm
}

export type { BirpcGroup } from 'birpc'

/** Origin-root route the assembled (layer-mode) devtools client is served from. */
export const UNIFIED_CLIENT_ROUTE = '/__nuxt-seo-devtools'

/**
 * The dev-only package that carries the DevTools UI build toolchain (`@nuxt/ui`, shiki,
 * tailwind, Carbon icons). It is NOT a runtime dependency of the SEO modules; it is added to
 * the user's devDependencies on demand (with their consent) the first time a panel is opened.
 */
const TOOLCHAIN_PACKAGE = 'nuxtseo-devtools'

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

const hashSet = (arr: string[]): string => [...JSON.stringify(arr)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7).toString(36)

function placeholderHtml(): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>Nuxt SEO DevTools</title>
<style>html,body{margin:0;height:100%;font-family:'Hubot Sans',system-ui,sans-serif;background:oklch(98.4% 0.005 292);color:oklch(16% 0.036 292)}@media(prefers-color-scheme:dark){html,body{background:oklch(11% 0.029 292);color:oklch(96.8% 0.009 292)}}.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center}.spin{width:34px;height:34px;border-radius:50%;border:3px solid color-mix(in oklab,oklch(54% 0.225 292) 25%,transparent);border-top-color:oklch(54% 0.225 292);animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}h1{font-size:15px;font-weight:600;margin:0}p{font-size:13px;opacity:.6;margin:0;max-width:440px}.mods{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:420px}.chip{font-size:11px;padding:2px 9px;border-radius:999px;background:color-mix(in oklab,oklch(54% 0.225 292) 14%,transparent);color:oklch(54% 0.225 292)}.btn{font:inherit;font-size:13px;font-weight:600;padding:7px 16px;border-radius:8px;border:0;background:oklch(54% 0.225 292);color:#fff;cursor:pointer}.btn:hover{background:oklch(49% 0.225 292)}.btn:disabled{opacity:.6;cursor:default}.hide{display:none}.step{font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;opacity:.55;max-width:520px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:16px}.t{font-variant-numeric:tabular-nums;opacity:.85}.err .spin{border-top-color:oklch(60% 0.2 25);border-color:color-mix(in oklab,oklch(60% 0.2 25) 25%,transparent);animation:none}</style></head>
<body><div class="wrap" id="wrap"><div class="spin" id="spin"></div><h1 id="title">Nuxt SEO DevTools</h1><div class="mods" id="mods"></div><p id="desc">Starting…</p><button class="btn hide" id="install">Install</button><div class="step" id="step"></div></div>
<script>
const $=id=>document.getElementById(id)
const esc=s=>(s||'').replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
let mods=false,clicked=false
$('install').addEventListener('click',async()=>{
  clicked=true
  $('install').disabled=true;$('install').classList.add('hide')
  $('spin').classList.remove('hide')
  $('title').textContent='Installing…'
  $('desc').textContent='Adding the dev-only DevTools UI to your project.'
  try{await fetch('${UNIFIED_CLIENT_ROUTE}/__install')}catch{}
})
async function poll(){
  try{
    const j=await (await fetch('${UNIFIED_CLIENT_ROUTE}/__status')).json()
    if(j.ready){location.reload();return}
    if(!mods&&Array.isArray(j.modules)&&j.modules.length){mods=true;$('mods').innerHTML=j.modules.map(m=>'<span class="chip">'+esc(m)+'</span>').join('')}
    if(j.failed){$('wrap').classList.add('err');$('spin').classList.remove('hide');$('install').classList.add('hide');$('title').textContent='DevTools unavailable';$('desc').textContent='';$('step').textContent=j.step||'';return}
    if(j.needsInstall&&!clicked){
      const pkg=j.packageName||'nuxtseo-devtools'
      $('spin').classList.add('hide')
      $('install').classList.remove('hide');$('install').disabled=false;$('install').textContent='Install '+pkg
      $('title').textContent='Nuxt SEO DevTools'
      $('desc').textContent='The panel needs '+pkg+' (dev only). Installing it adds the package to your devDependencies; nothing is changed until you choose to install.'
      $('step').textContent=''
      return
    }
    $('spin').classList.remove('hide');$('install').classList.add('hide')
    $('title').textContent=j.installing?'Installing…':'Building Nuxt SEO DevTools…'
    $('desc').textContent=j.installing?'Adding the dev-only DevTools UI to your project.':'Assembling panels for your installed modules. This runs once.'
    const t=j.elapsed?' · <span class="t">'+Math.round(j.elapsed/1000)+'s</span>':''
    $('step').innerHTML=esc(j.step)+t
  }catch{}
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
function resolveBaseLayer(installed: SeoDevtoolsEntry[]): string {
  for (const m of installed) {
    try {
      return dirname(createRequire(join(m.layerDir, 'index.js')).resolve('nuxtseo-layer-devtools'))
    }
    catch {
      // expected when this module doesn't depend on the layer — try the next one
    }
  }
  console.warn('[nuxt-seo] could not resolve nuxtseo-layer-devtools from any installed SEO module — add it to the module\'s dependencies. Falling back to a bare specifier, which only works when your app installs it directly.')
  return 'nuxtseo-layer-devtools'
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
  /** Latest human-readable build step (most recent consola/Nuxt status line). */
  onProgress: (step: string) => void
  onReady: () => void
  onError: (message?: string) => void
}

/**
 * Has the DevTools UI toolchain been provisioned? We mark it by the presence of the
 * `nuxtseo-devtools` package (a direct, top-level dependency once added) rather than probing
 * `@nuxt/ui` directly — under pnpm a transitively-installed `@nuxt/ui` isn't linked into the
 * app's top-level `node_modules`, so a bare `resolve('@nuxt/ui')` from the root would miss it.
 */
function toolchainInstalled(rootDir: string): boolean {
  try {
    createRequire(join(rootDir, 'index.js')).resolve(`${TOOLCHAIN_PACKAGE}/package.json`)
    return true
  }
  catch {
    return false
  }
}

/** Build the per-package-manager `add devDependency` argv for the detected client. */
async function devAddArgs(rootDir: string): Promise<{ command: string, args: string[] }> {
  const pm = await detectPackageManager(rootDir).catch(() => null)
  const name = pm?.name ?? 'npm'
  if (name === 'npm')
    return { command: 'npm', args: ['install', '--save-dev', TOOLCHAIN_PACKAGE] }
  if (name === 'yarn')
    return { command: 'yarn', args: ['add', '--dev', TOOLCHAIN_PACKAGE] }
  // pnpm, bun, deno
  return { command: name, args: ['add', '-D', TOOLCHAIN_PACKAGE] }
}

/**
 * Install the DevTools UI toolchain into the user's devDependencies. Runs as a DevTools-tracked
 * subprocess (`startSubprocess`) so the output streams into the DevTools terminal panel, and the
 * package manager's own `add` updates `package.json` + the lockfile. Only ever called after the
 * user opts in via the panel's Install button — never silently. Resolves to whether the toolchain
 * is resolvable afterwards.
 */
async function installToolchain(rootDir: string, nuxt: Nuxt, onProgress: (step: string) => void): Promise<boolean> {
  const { command, args } = await devAddArgs(rootDir)
  onProgress(`Installing ${TOOLCHAIN_PACKAGE} with ${command}…`)
  return await new Promise<boolean>((resolve) => {
    // Pass `nuxt` explicitly: this runs inside a Vite middleware request, where `useNuxt()`
    // (startSubprocess's default) has no active async context and would throw.
    const { getProcess } = startSubprocess(
      { command, args, cwd: rootDir },
      { id: 'nuxt-seo:install-devtools', name: `Install ${TOOLCHAIN_PACKAGE}`, icon: 'carbon:download' },
      nuxt,
    )
    const proc = getProcess()
    proc.on('exit', (code: number | null) => resolve(code === 0 && toolchainInstalled(rootDir)))
    proc.on('error', (err: Error) => {
      console.error(`[nuxt-seo] could not run "${command} ${args.join(' ')}": ${err.message}`)
      resolve(false)
    })
  })
}

function generateAndBuild(cacheDir: string, rootDir: string, installed: SeoDevtoolsEntry[], hooks: BuildHooks): void {
  const routes = ['/', ...installed.flatMap(m => deriveRoutes(m.layerDir, m.slug))]
  const extendsList = [resolveBaseLayer(installed), ...installed.map(m => m.layerDir)]
  mkdirSync(join(cacheDir, 'pages'), { recursive: true })
  writeFileSync(join(cacheDir, 'nuxt.config.ts'), `import { resolve } from 'pathe'
export default defineNuxtConfig({
  extends: ${JSON.stringify(extendsList, null, 2)},
  ssr: false,
  robots: false,
  content: false,
  sitemap: false,
  nitro: { prerender: { routes: ${JSON.stringify(routes)} }, output: { publicDir: resolve(__dirname, './dist/devtools') } },
  app: { baseURL: '${UNIFIED_CLIENT_ROUTE}' },
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
  const child = cliBin
    ? spawn(process.execPath, [cliBin, 'build'], { cwd: cacheDir, stdio: ['inherit', 'pipe', 'pipe'] })
    : spawn('npx', ['nuxi', 'build'], { cwd: cacheDir, stdio: ['inherit', 'pipe', 'pipe'], shell: true })
  // Match consola/Nuxt status lines (leading glyph like ℹ ✔ ✨ ⚠ ✖ ● ➜, or a `[scope]`
  // tag such as `[nitro]`). Whitelisting these keeps the surfaced step readable and skips
  // the code-frames, carets and box-drawing the build tooling interleaves.
  const statusLine = /^(?:[ℹ✔✓✨⚠✖✗●➜√]|\[\w)/
  const forward = (chunk: Buffer, sink: NodeJS.WriteStream): void => {
    sink.write(chunk)
    const step = stripAnsi(chunk.toString())
      .split('\n')
      .map(l => l.trim())
      .filter(l => statusLine.test(l))
      .pop()
    if (step)
      hooks.onProgress(step)
  }
  child.stdout?.on('data', c => forward(c, process.stdout))
  child.stderr?.on('data', c => forward(c, process.stderr))
  // Without an error handler, a spawn failure (e.g. ENOENT) surfaces as an
  // uncaughtException and takes the whole dev server down with it. Swallow it here and
  // leave the panel in its "Building…" placeholder instead.
  child.on('error', (err) => {
    console.error(`[nuxt-seo] could not build devtools client, the panel will stay unavailable: ${err.message}`)
    hooks.onError()
  })
  child.on('exit', (code) => {
    if (code === 0) {
      writeFileSync(join(cacheDir, '.installed-hash'), hashSet(installed.map(m => m.slug).sort()))
      hooks.onReady()
      // eslint-disable-next-line no-console
      console.log('[nuxt-seo] devtools client ready')
    }
    else {
      console.error(`[nuxt-seo] devtools client build exited with code ${code}, the panel will stay unavailable`)
      hooks.onError()
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

  addCustomTab({ name: `nuxt-seo-${slug}`, title: config.title, icon: config.icon, view: { type: 'iframe', src: clientRoute } })

  if ((nuxt as any)._seoDevtoolsInit)
    return
  (nuxt as any)._seoDevtoolsInit = true

  const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/nuxt-seo-devtools')
  const dist = join(cacheDir, 'dist/devtools')
  const state = { ready: false, building: false, installing: false, needsInstall: false, failed: false, startedAt: 0, step: '', modules: [] as string[] }
  const rootDir = nuxt.options.rootDir

  // Build lazily: only the first request to the client route (i.e. when the user actually
  // opens a devtools panel) kicks off the build, so we never spend time assembling a
  // client nobody opens during the dev session.
  function ensureBuilt(): void {
    if (state.ready || state.building)
      return
    state.building = true
    state.failed = false
    state.startedAt = Date.now()
    state.step = 'Starting build…'
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers
    state.modules = installed.map(m => m.title)
    generateAndBuild(cacheDir, rootDir, installed, {
      onProgress: (step) => {
        state.step = step
      },
      onReady: () => {
        state.ready = true
        state.building = false
      },
      onError: (message) => {
        state.building = false
        state.failed = true
        state.step = message ?? 'Build failed, see the dev server logs'
      },
    })
  }

  // User opted in via the panel's Install button: add the dev-only toolchain, then build.
  // Never runs without that explicit click — we don't mutate the user's package.json silently.
  function startInstall(): void {
    if (state.installing || state.building || state.ready)
      return
    state.installing = true
    state.needsInstall = false
    state.failed = false
    state.startedAt = Date.now()
    state.step = `Installing ${TOOLCHAIN_PACKAGE}…`
    installToolchain(rootDir, nuxt, (step) => {
      state.step = step
    }).then((ok) => {
      state.installing = false
      if (ok) {
        ensureBuilt()
      }
      else {
        state.failed = true
        state.step = `Could not install ${TOOLCHAIN_PACKAGE} — see the dev server logs`
      }
    }).catch((err) => {
      state.installing = false
      state.failed = true
      state.step = `Could not install ${TOOLCHAIN_PACKAGE} — see the dev server logs`
      console.error(`[nuxt-seo] devtools toolchain install failed: ${(err as Error).message}`)
    })
  }

  nuxt.hook('modules:done', () => {
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers
    const key = hashSet(installed.map(m => m.slug).sort())
    state.ready = existsSync(join(cacheDir, '.installed-hash')) && readFileSync(join(cacheDir, '.installed-hash'), 'utf8') === key && existsSync(dist)
  })

  nuxt.hook('vite:serverCreated', (server) => {
    const serve = sirv(dist, { dev: true, single: '200.html' })
    server.middlewares.use(UNIFIED_CLIENT_ROUTE, (req, res, next) => {
      const url = req.url || '/'

      // Triggered by the placeholder's Install button — the only path that mutates package.json.
      if (url.startsWith('/__install')) {
        startInstall()
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({ installing: state.installing }))
      }

      if (url.startsWith('/__status')) {
        // When the toolchain is already present, build straight away; otherwise wait for the
        // user to opt in (surfaced as `needsInstall`) instead of installing unprompted.
        if (!state.ready && !state.building && !state.installing) {
          if (toolchainInstalled(rootDir))
            ensureBuilt()
          else
            state.needsInstall = true
        }
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({
          ready: state.ready,
          failed: state.failed,
          needsInstall: state.needsInstall,
          installing: state.installing,
          packageName: TOOLCHAIN_PACKAGE,
          step: state.step,
          modules: state.modules,
          elapsed: state.startedAt ? Date.now() - state.startedAt : 0,
        }))
      }

      if (!state.ready) {
        res.setHeader('content-type', 'text/html')
        return res.end(placeholderHtml())
      }
      return serve(req, res, next)
    })
  })
}

/**
 * Legacy mode: the module ships a prebuilt devtools client at `./devtools`. Serve it
 * at the module's own route (or proxy to its dev server when not built). Preserved so a
 * module that hasn't migrated to the layer format keeps working with this version.
 */
function setupLegacyModule(config: DevToolsUIConfig, clientPath: string, nuxt: Nuxt): void {
  const { name, title, icon, devPort = 3030 } = config
  const slug = config.slug ?? name.replace(/^nuxt-/, '')
  const route = config.route ?? `/__${slug}`

  const modules: SeoModuleInfo[] = (nuxt as any)._seoDevtoolsModules ??= []
  modules.push({ name, npm: npmForSlug(slug), title, icon, route })

  const isProductionBuild = existsSync(clientPath) && readdirSync(clientPath).length > 0
  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', (server) => {
      server.middlewares.use(route, sirv(clientPath, { dev: true, single: true }))
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (viteConfig) => {
      Object.assign(viteConfig, {
        server: {
          ...viteConfig.server,
          proxy: {
            ...viteConfig.server?.proxy,
            [route]: {
              target: `http://localhost:${devPort}${route}`,
              changeOrigin: true,
              followRedirects: true,
              ws: true,
              rewrite: (p: string) => p.replace(route, ''),
              configure: (proxy: any) => {
                proxy.on('error', (err: Error, _req: any, res: any) => {
                  if (res.headersSent)
                    return
                  res.writeHead(502, { 'Content-Type': 'text/plain' })
                  res.end(`Devtools client not ready: ${err.message}`)
                })
              },
            },
          },
        },
      })
    })
  }

  addCustomTab({ name, title, icon, view: { type: 'iframe', src: route } })
}

/**
 * Register a module's devtools panel. Detects whether the module ships a source layer
 * (current) or a prebuilt client (legacy) and handles each, so old and new modules can
 * be mixed during migration.
 */
export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  if (!nuxt.options.dev)
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
    setupLegacyModule(config, layerDir, nuxt)
}

export function setupDevToolsRpc<
  ServerFunctions extends object,
  ClientFunctions extends object,
>(
  namespace: string,
  serverFunctions: ServerFunctions,
  nuxt: Nuxt = useNuxt(),
): Promise<BirpcGroup<ClientFunctions, ServerFunctions>> {
  return new Promise((resolve) => {
    onDevToolsInitialized(() => {
      resolve(extendServerRpc<ClientFunctions, ServerFunctions>(namespace, serverFunctions, nuxt))
    }, nuxt)
  })
}

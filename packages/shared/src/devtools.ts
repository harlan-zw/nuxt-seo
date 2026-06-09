import type { Resolver } from '@nuxt/kit'
import type { BirpcGroup } from 'birpc'
import type { Nuxt } from 'nuxt/schema'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
import sirv from 'sirv'

export type { BirpcGroup } from 'birpc'

/** Origin-root route the assembled devtools client is served from. */
export const UNIFIED_CLIENT_ROUTE = '/__nuxt-seo-devtools'

export interface DevToolsUIConfig {
  /** Legacy per-module route — no longer served; kept for back-compat. */
  route?: string
  name: string
  title: string
  icon: string
  /** Route segment inside the client (e.g. `robots`). Defaults to name minus `nuxt-`. */
  slug?: string
}

export interface SeoModuleInfo {
  name: string
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
<style>html,body{margin:0;height:100%;font-family:'Hubot Sans',system-ui,sans-serif;background:oklch(98.4% 0.005 292);color:oklch(16% 0.036 292)}@media(prefers-color-scheme:dark){html,body{background:oklch(11% 0.029 292);color:oklch(96.8% 0.009 292)}}.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}.spin{width:34px;height:34px;border-radius:50%;border:3px solid color-mix(in oklab,oklch(54% 0.225 292) 25%,transparent);border-top-color:oklch(54% 0.225 292);animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}h1{font-size:15px;font-weight:600;margin:0}p{font-size:13px;opacity:.6;margin:0}</style></head>
<body><div class="wrap"><div class="spin"></div><h1>Building Nuxt SEO DevTools…</h1><p>Assembling panels for your installed modules. This runs once.</p></div>
<script>setInterval(async()=>{try{const r=await fetch('${UNIFIED_CLIENT_ROUTE}/__status');const j=await r.json();if(j.ready)location.reload()}catch{}},1000)</script></body></html>`
}

/** Full route list for a module: `/slug` + `/slug/<page>` for each non-index page. */
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

function generateAndBuild(cacheDir: string, baseLayer: string, installed: SeoDevtoolsEntry[], onReady: () => void): void {
  const routes = ['/', ...installed.flatMap(m => deriveRoutes(m.layerDir, m.slug))]
  const extendsList = [baseLayer, ...installed.map(m => m.layerDir)]
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
  const child = spawn('npx', ['nuxi', 'build'], { cwd: cacheDir, stdio: 'inherit' })
  child.on('exit', (code) => {
    if (code === 0) {
      writeFileSync(join(cacheDir, '.installed-hash'), hashSet(installed.map(m => m.slug).sort()))
      onReady()
      // eslint-disable-next-line no-console
      console.log('[nuxt-seo] devtools client ready')
    }
  })
}

/**
 * Register a module's devtools panel. Each SEO module calls this from its module
 * setup; the panels are assembled into ONE client built in the user's project from
 * exactly the installed modules' layers (async, with a Building… placeholder), so the
 * vendor/fonts/css ship once instead of per-module. First call wins the orchestration.
 */
export function setupDevToolsUI(config: DevToolsUIConfig, resolve: Resolver['resolve'], nuxt: Nuxt = useNuxt()): void {
  if (!nuxt.options.dev)
    return

  const slug = config.slug ?? config.name.replace(/^nuxt-/, '')
  const list: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsModules ??= []
  list.push({ slug, name: config.name, title: config.title, icon: config.icon, layerDir: resolve('./devtools') })

  if ((nuxt as any)._seoDevtoolsInit)
    return
  (nuxt as any)._seoDevtoolsInit = true

  const cacheDir = join(nuxt.options.rootDir, 'node_modules/.cache/nuxt-seo-devtools')
  const dist = join(cacheDir, 'dist/devtools')
  const state = { ready: false }

  // Build once after every module has registered.
  nuxt.hook('modules:done', () => {
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsModules
    const key = hashSet(installed.map(m => m.slug).sort())
    state.ready = existsSync(join(cacheDir, '.installed-hash')) && readFileSync(join(cacheDir, '.installed-hash'), 'utf8') === key && existsSync(dist)
    if (!state.ready)
      generateAndBuild(cacheDir, 'nuxtseo-layer-devtools', installed, () => { state.ready = true })
  })

  // Serve: placeholder until ready, then the assembled client (connect strips the prefix).
  nuxt.hook('vite:serverCreated', (server) => {
    const serve = sirv(dist, { dev: true, single: '200.html' })
    server.middlewares.use(UNIFIED_CLIENT_ROUTE, (req, res, next) => {
      if ((req.url || '/').startsWith('/__status')) {
        res.setHeader('content-type', 'application/json')
        return res.end(JSON.stringify({ ready: state.ready }))
      }
      if (!state.ready) {
        res.setHeader('content-type', 'text/html')
        return res.end(placeholderHtml())
      }
      return serve(req, res, next)
    })
  })

  onDevToolsInitialized(() => {
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsModules
    extendServerRpc('nuxt-seo-modules', {
      getInstalledSeoModules: (): SeoModuleInfo[] => installed.map(m => ({ name: m.slug, title: m.title, icon: m.icon, route: `${UNIFIED_CLIENT_ROUTE}/${m.slug}` })),
    }, nuxt)
    for (const m of installed)
      addCustomTab({ name: `nuxt-seo-${m.slug}`, title: m.title, icon: m.icon, view: { type: 'iframe', src: `${UNIFIED_CLIENT_ROUTE}/${m.slug}` } })
  }, nuxt)
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

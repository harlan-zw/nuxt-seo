import type { Resolver } from '@nuxt/kit'
import type { BirpcGroup } from 'birpc'
import type { Nuxt } from 'nuxt/schema'
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { addCustomTab, extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import { useNuxt } from '@nuxt/kit'
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
<style>html,body{margin:0;height:100%;font-family:'Hubot Sans',system-ui,sans-serif;background:oklch(98.4% 0.005 292);color:oklch(16% 0.036 292)}@media(prefers-color-scheme:dark){html,body{background:oklch(11% 0.029 292);color:oklch(96.8% 0.009 292)}}.wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}.spin{width:34px;height:34px;border-radius:50%;border:3px solid color-mix(in oklab,oklch(54% 0.225 292) 25%,transparent);border-top-color:oklch(54% 0.225 292);animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}h1{font-size:15px;font-weight:600;margin:0}p{font-size:13px;opacity:.6;margin:0}</style></head>
<body><div class="wrap"><div class="spin"></div><h1>Building Nuxt SEO DevTools…</h1><p>Assembling panels for your installed modules. This runs once.</p></div>
<script>setInterval(async()=>{try{const r=await fetch('${UNIFIED_CLIENT_ROUTE}/__status');const j=await r.json();if(j.ready)location.reload()}catch{}},1000)</script></body></html>`
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

function generateAndBuild(cacheDir: string, installed: SeoDevtoolsEntry[], onReady: () => void): void {
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
  const state = { ready: false }

  nuxt.hook('modules:done', () => {
    const installed: SeoDevtoolsEntry[] = (nuxt as any)._seoDevtoolsLayers
    const key = hashSet(installed.map(m => m.slug).sort())
    state.ready = existsSync(join(cacheDir, '.installed-hash')) && readFileSync(join(cacheDir, '.installed-hash'), 'utf8') === key && existsSync(dist)
    if (!state.ready)
      generateAndBuild(cacheDir, installed, () => { state.ready = true })
  })

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
  const layerCandidates = [resolve('./devtools'), resolve('../devtools')]
  const layerDir = layerCandidates.find(dir => existsSync(join(dir, 'nuxt.config.ts'))) ?? layerCandidates[0]
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

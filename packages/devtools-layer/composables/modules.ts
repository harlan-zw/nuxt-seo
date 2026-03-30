import type { NuxtDevtoolsIframeClient } from '@nuxt/devtools-kit/types'
import type { NuxtSEOModule } from 'nuxtseo-shared/const'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
import { modules as seoModules } from 'nuxtseo-shared/const'
import { computed, ref } from 'vue'
import { isConnected } from './state'

export interface SeoModuleInfo {
  name: string
  title: string
  icon: string
  route: string
}

export interface SeoModuleCatalogEntry {
  name: string
  title: string
  description: string
  icon: string
  installed: boolean
  route?: string
  npm: string
  repo: string
  playgrounds?: Record<string, string>
}

// Map slug to the internal module name used by devtools routing
const SLUG_TO_MODULE_NAME: Record<string, string> = {
  'robots': 'nuxt-robots',
  'sitemap': 'sitemap',
  'og-image': 'nuxt-og-image',
  'schema-org': 'nuxt-schema-org',
  'seo-utils': 'nuxt-seo-utils',
  'link-checker': 'nuxt-link-checker',
  'site-config': 'nuxt-site-config',
  'ai-ready': 'nuxt-ai-ready',
  'skew-protection': 'nuxt-skew-protection',
  'ai-kit': 'nuxt-ai-kit',
  'nuxt-seo': 'nuxt-seo',
}

const ICONIFY_RE = /^i-([^-]+)-/

function toIconify(icon: string): string {
  // Convert i-carbon-bot -> carbon:bot
  return icon.replace(ICONIFY_RE, '$1:')
}

function moduleToCatalogEntry(mod: NuxtSEOModule): Omit<SeoModuleCatalogEntry, 'installed' | 'route'> {
  return {
    name: SLUG_TO_MODULE_NAME[mod.slug] || mod.slug,
    title: mod.label,
    description: mod.description,
    icon: toIconify(mod.icon),
    npm: mod.npm,
    repo: mod.repo,
    playgrounds: mod.playgrounds,
  }
}

// Exclude the meta 'nuxt-seo' entry from the catalog, it's not a standalone devtools module
const MODULE_CATALOG = seoModules
  .filter(m => m.slug !== 'nuxt-seo')
  .map(moduleToCatalogEntry)

export const installedModules = ref<SeoModuleInfo[]>([])
export const showModuleSplash = ref(false)

export const moduleCatalog = computed<SeoModuleCatalogEntry[]>(() => {
  return MODULE_CATALOG.map((entry) => {
    const installed = installedModules.value.find(m => m.name === entry.name)
    return {
      ...entry,
      installed: !!installed,
      route: installed?.route,
    }
  })
})

export function findModuleByName(moduleName: string): SeoModuleCatalogEntry | undefined {
  return moduleCatalog.value.find(m => m.name === moduleName)
}

export function fetchInstalledModules(): void {
  const inIframe = window.parent !== window
  if (!inIframe)
    return

  onDevtoolsClientConnected(async (client) => {
    const rpc = client.devtools.extendClientRpc('nuxt-seo-modules', {})
    try {
      const modules = await (rpc as any).getInstalledSeoModules()
      if (Array.isArray(modules))
        installedModules.value = modules
    }
    catch {
      // RPC not available (module might not have the shared registration)
    }
  })
}

function resolveDevtoolsIframe(): NuxtDevtoolsIframeClient | undefined {
  // We're inside the devtools iframe, so we need to go up to the parent devtools frame
  try {
    const devtoolsWindow = window.parent
    if (!devtoolsWindow)
      return
    return (devtoolsWindow as any).__NUXT_DEVTOOLS__ as NuxtDevtoolsIframeClient
  }
  catch {
    return undefined
  }
}

export function switchToModule(moduleName: string): void {
  if (!isConnected.value)
    return

  const devtoolsClient = resolveDevtoolsIframe()
  if (!devtoolsClient)
    return

  const iframe = devtoolsClient.host?.getIframe?.()
  if (iframe) {
    iframe.src = `/__nuxt_devtools__/client/modules/custom-${moduleName}`
  }

  showModuleSplash.value = false
}

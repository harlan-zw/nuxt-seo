import type { NuxtDevtoolsIframeClient } from '@nuxt/devtools-kit/types'
import { onDevtoolsClientConnected } from '@nuxt/devtools-kit/iframe-client'
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
  npmUrl: string
  pro?: boolean
}

// Full catalog of all Nuxt SEO modules for the splash screen
const MODULE_CATALOG: Omit<SeoModuleCatalogEntry, 'installed' | 'route'>[] = [
  { name: 'nuxt-robots', title: 'Robots', description: 'Manage robots.txt and meta robots', icon: 'carbon:bot', npmUrl: 'https://npmjs.com/package/@nuxtjs/robots' },
  { name: 'sitemap', title: 'Sitemap', description: 'Generate XML sitemaps', icon: 'carbon:load-balancer-application', npmUrl: 'https://npmjs.com/package/@nuxtjs/sitemap' },
  { name: 'nuxt-og-image', title: 'OG Image', description: 'Generate dynamic Open Graph images', icon: 'carbon:image-search', npmUrl: 'https://npmjs.com/package/nuxt-og-image' },
  { name: 'nuxt-schema-org', title: 'Schema.org', description: 'Add structured data with Schema.org', icon: 'carbon:chart-relationship', npmUrl: 'https://npmjs.com/package/nuxt-schema-org' },
  { name: 'nuxt-seo-utils', title: 'SEO Utils', description: 'Core SEO utilities and meta tags', icon: 'carbon:search-locate', npmUrl: 'https://npmjs.com/package/nuxt-seo-utils' },
  { name: 'nuxt-link-checker', title: 'Link Checker', description: 'Find and fix broken links', icon: 'carbon:cloud-satellite-link', npmUrl: 'https://npmjs.com/package/nuxt-link-checker' },
  { name: 'nuxt-site-config', title: 'Site Config', description: 'Shared site configuration', icon: 'carbon:settings', npmUrl: 'https://npmjs.com/package/nuxt-site-config' },
  { name: 'nuxt-ai-ready', title: 'AI Ready', description: 'Optimize for AI search engines', icon: 'carbon:machine-learning-model', npmUrl: 'https://npmjs.com/package/nuxt-ai-ready', pro: true },
  { name: 'nuxt-skew-protection', title: 'Skew Protection', description: 'Protect against deployment skew', icon: 'carbon:shield-check', npmUrl: 'https://npmjs.com/package/nuxt-skew-protection', pro: true },
]

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

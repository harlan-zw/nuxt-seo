import type { Ref } from '@vue/reactivity'

export interface NuxtSeoModule {
  id: string
  slug: string
  label: string
  fullLabel?: string
  icon: string
  description: string
  to: string
  repo: string
  downloads?: string
  stars?: string | number
  tag?: {
    label: string
    to: string
  }
  unlisted?: boolean
  routeRules?: Record<string, any>
}

export const SiteConfigModule: NuxtSeoModule = {
  unlisted: true,
  id: 'site-config',
  slug: 'site-config',
  tag: {
    label: 'Released',
    to: '/site-config/getting-started/installation',
  },
  label: 'Site Config',
  icon: 'carbon:settings-check',
  description: 'Powerful build and runtime shared site configuration for Nuxt modules.',
  to: '/site-config/getting-started/installation',
  repo: 'harlan-zw/nuxt-site-config',
  routeRules: {
    site: { name: 'Nuxt Site Config', description: 'Shared site configuration for Nuxt modules.' },
    ogImage: { icon: 'carbon:settings-check' },
  },
} as const

export const SeoModules: NuxtSeoModule[] = [
  {
    id: 'simple-robots',
    slug: 'robots',
    label: 'Robots',
    fullLabel: 'Nuxt Simple Robots',
    icon: 'carbon:bot',
    description: 'Tame the robots crawling and indexing your site with ease.',
    tag: {
      label: 'v3',
      to: '/robots/releases/v3',
    },
    to: '/robots/getting-started/installation',
    repo: 'harlan-zw/nuxt-simple-robots',
  },
  {
    id: 'simple-sitemap',
    slug: 'sitemap',
    label: 'Sitemap',
    tag: {
      new: true,
      label: 'v4',
      to: '/sitemap/releases/v4',
    },
    fullLabel: 'Nuxt Simple Sitemap',
    to: '/sitemap/getting-started/installation',
    icon: 'carbon:load-balancer-application',
    description: 'Powerfully flexible XML Sitemaps that integrate seamlessly.',
    repo: 'harlan-zw/nuxt-simple-sitemap',
  },
  {
    id: 'og-image',
    slug: 'og-image',
    label: 'OG Image',
    icon: 'carbon:image-search',
    description: 'Dynamic and build-time OG Image generation with Satori and Browser Screenshot support.',
    tag: {
      label: 'v2',
      to: '/experiments/releases/v2',
    },
    to: '/og-image/getting-started/installation',
    repo: 'harlan-zw/nuxt-og-image',
  },
  {
    id: 'link-checker',
    slug: 'link-checker',
    label: 'Link Checker',
    tag: {
      label: 'v2',
      to: '/link-checker/releases/v2',
    },
    to: '/link-checker/getting-started/installation',
    icon: 'carbon:cloud-satellite-link',
    description: 'Find and magically fix links that may be negatively effecting your SEO.',
    repo: 'harlan-zw/nuxt-link-checker',
  },
  {
    id: 'seo-experiments',
    label: 'Experiments',
    fullLabel: 'Nuxt SEO Experiments',
    slug: 'experiments',
    icon: 'carbon:chemistry',
    tag: {
      label: 'v3',
      to: '/experiments/releases/v3',
    },
    description: 'Powerful SEO DX improvements that may or may not land in the Nuxt core.',
    to: '/experiments/getting-started/installation',
    repo: 'harlan-zw/nuxt-seo-experiments',
  },
  {
    id: 'schema-org',
    slug: 'schema-org',
    label: 'Schema.org',
    icon: 'carbon:chart-relationship',
    tag: {
      label: 'v3',
      to: '/schema-org/getting-started/installation',
    },
    to: '/schema-org/getting-started/installation',
    description: 'The quickest and easiest way to build Schema.org graphs.',
    repo: 'harlan-zw/nuxt-schema-org',
  },
  {
    unlisted: true,
    id: 'seo-ui',
    slug: 'ui',
    label: 'SEO UI',
    icon: 'carbon:brush-freehand',
    description: 'Fully styled and customizable components for improving your SEO.',
    to: '/ui',
    repo: 'harlan-zw/nuxt-seo-ui',
  },
  SiteConfigModule,
]

export function useModuleList(): NuxtSeoModule[]
export function useModuleList(module?: Ref<string>) {
  const publicRuntimeConfig = useRuntimeConfig().public
  const modules = SeoModules.map((m) => {
    const stats = (publicRuntimeConfig.moduleStats as any[] || []).find(m2 => m2.id === m?.id)?.stats || {}
    if (stats?.downloads) {
      // will look like 395493, we need to make it human readible using native APIs
      // we want to display it like 395k
      m.downloads = Number(stats.downloads).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
    }
    if (stats?.stars)
      m.stars = Number(stats.stars)
    const version = publicRuntimeConfig.moduleDeps[m.repo.replace('harlan-zw/', '')].replace('^', '')
    m.tag = m.tag || {}
    // version is like 3.10.30, we want to just get the first two, like 3.10
    m.tag.label = `v${version.split('.').slice(0, 2).join('.')}`
    return m
  })
  if (module?.value)
    return computed(() => modules.find(m => m.id === module.value))
  return modules
}

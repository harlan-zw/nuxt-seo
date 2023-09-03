export const SiteConfigModule = {
  tag: {
    label: 'Released',
    to: '/site-config/getting-started/installation',
  },
  label: 'Site Config',
  icon: 'carbon:settings-check',
  description: 'Shared site configuration for Nuxt modules.',
  to: '/site-config/getting-started/installation',
  // repo: 'harlan-zw/nuxt-site-config',
  routeRules: {
    site: { name: 'Nuxt Site Config', description: 'Shared site configuration for Nuxt modules.' },
    ogImage: { icon: 'carbon:settings-check' },
  },
} as const

export function useModuleList() {
  return [
    {
      label: 'Robots',
      icon: 'carbon:bot',
      description: 'Tame the robots crawling and indexing your site with ease.',
      tag: {
        label: 'v3 Released',
        to: '/robots/releases/v3',
      },
      to: '/robots/getting-started/installation',
      repo: 'harlan-zw/nuxt-simple-robots',
    },
    {
      label: 'Sitemap',
      tag: {
        label: 'v3 Released',
        to: '/sitemap/releases/v3',
      },
      to: '/sitemap/getting-started/installation',
      icon: 'carbon:load-balancer-application',
      description: 'Powerfully flexible XML Sitemaps that integrate seamlessly.',
      repo: 'harlan-zw/nuxt-simple-sitemap',
    },
    {
      label: 'OG Image',
      icon: 'carbon:image-search',
      description: 'Dynamic and build-time OG Image generation with Satori and Browser Screenshot support.',
      tag: {
        label: 'v2 Released',
        to: '/experiments/releases/v2',
      },
      to: '/og-image/getting-started/installation',
      repo: 'harlan-zw/nuxt-og-image',
    },
    {
      label: 'Link Checker',
      tag: {
        label: 'v2 Released',
        to: '/link-checker/releases/v2',
      },
      to: '/link-checker/getting-started/installation',
      icon: 'carbon:cloud-satellite-link',
      description: 'Find and magically fix links that may be negatively effecting your SEO.',
      repo: 'harlan-zw/nuxt-link-checker',
    },
    {
      label: 'Experiments',
      icon: 'carbon:chemistry',
      tag: {
        label: 'v3 Released',
        to: '/experiments/releases/v3',
      },
      description: 'Powerful SEO DX improvements that may or may not land in the Nuxt core.',
      to: '/experiments/getting-started/installation',
      repo: 'harlan-zw/nuxt-seo-experiments',
    },
    {
      label: 'Schema.org',
      icon: 'carbon:chart-relationship',
      tag: {
        label: 'v3 Released',
        to: '/schema-org/getting-started/installation',
      },
      to: '/schema-org/getting-started/installation',
      description: 'The quickest and easiest way to build Schema.org graphs.',
      repo: 'harlan-zw/nuxt-schema-org',
    },
    {
      label: 'SEO UI',
      icon: 'carbon:brush-freehand',
      description: 'Fully styled and customizable components for improving your SEO.',
    },
    SiteConfigModule,
  ] as const
}

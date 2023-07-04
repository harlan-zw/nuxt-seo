export function useModuleList() {
  return [
    {
      label: 'OG Image',
      icon: 'i-heroicons-document-duplicate-20-solid',
      description: 'Dynamic and build-time OG Image generation with Satori and Browser Screenshot support.',
      tag: '🎉 v2 Released',
      to: '/og-image/getting-started/installation',
      repo: 'harlan-zw/nuxt-og-image',
    },
    {
      label: 'Experiments',
      icon: 'i-heroicons-trash-20-solid',
      tag: '🎉 v3 Released',
      description: 'Powerful SEO DX improvements that may or may not land in the Nuxt core.',
      to: '/experiments/getting-started/installation',
      repo: 'harlan-zw/nuxt-seo-experiments',
    },
    {
      label: 'Robots',
      icon: 'i-heroicons-cog-20-solid',
      description: 'The simplest way to control the robots crawling and indexing your Nuxt site.',
      tag: 'coming soon',
    },
    {
      label: 'Sitemap',
      icon: 'i-heroicons-pencil-square-20-solid',
      description: 'The simplest way to add XML Sitemaps to your Nuxt site.',
      tag: 'coming soon',
    },
    {
      label: 'Schema.org',
      icon: 'i-heroicons-archive-box-20-solid',
      description: 'The quickest and easiest way to build Schema.org graphs for Nuxt.',
      tag: 'coming soon',
    },
    {
      label: 'Link Checker',
      icon: 'i-heroicons-arrow-right-circle-20-solid',
      description: 'Identify and fix link issues for Nuxt apps.',
      tag: 'coming soon',
    },
    {
      label: 'SEO UI',
      icon: 'i-heroicons-trash-20-solid',
      description: 'Fully styled and customizable components for improving your Nuxt SEO.',
      tag: 'coming soon',
    },
    {
      label: 'Site Config',
      icon: 'i-heroicons-trash-20-solid',
      description: 'A simple, extendable way to configure your site config.',
      tag: 'coming soon',
    },
  ]
}

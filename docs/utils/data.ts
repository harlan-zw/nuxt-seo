export function useModuleList() {
  return [
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
      icon: 'carbon:load-balancer-application',
      description: 'Powerfully flexible XML Sitemaps that integrate seamlessly.',
      repo: 'harlan-zw/nuxt-simple-sitemap',
    },
    {
      label: 'Schema.org',
      icon: 'carbon:chart-relationship',
      description: 'The quickest and easiest way to build Schema.org graphs.',
      repo: 'harlan-zw/unhead-schema-org',
    },
    {
      label: 'Link Checker',
      icon: 'carbon:cloud-satellite-link',
      description: 'Fix broken links and avoid unnecessary redirects.',
      repo: 'harlan-zw/nuxt-link-checker',
    },
    {
      label: 'SEO UI',
      icon: 'carbon:brush-freehand',
      description: 'Fully styled and customizable components for improving your SEO.',
    },
    {
      label: 'Site Config',
      icon: 'carbon:settings-check',
      description: 'A simple, extendable way to configure your site config.',
    },
  ]
}

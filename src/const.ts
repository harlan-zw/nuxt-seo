export interface NuxtSEOModule {
  slug: string
  label: string
  icon: string
  description: string
  repo: string
  npm: string
}

export const NuxtSEO: NuxtSEOModule = {
  slug: 'nuxt-seo',
  label: 'Nuxt SEO - All-in-One',
  icon: 'i-carbon-settings-check',
  description: 'All the boring SEO work for Nuxt done.',
  repo: 'harlan-zw/nuxt-seo',
  npm: '@nuxtjs/seo',
}

export const SiteConfigModule: NuxtSEOModule = {
  slug: 'site-config',
  label: 'Site Config',
  icon: 'i-carbon-settings-check',
  description: 'Powerful build and runtime shared site configuration for Nuxt modules.',
  repo: 'harlan-zw/nuxt-site-config',
  npm: 'nuxt-site-config',
}

export const RobotsModule: NuxtSEOModule = {
  slug: 'robots',
  label: 'Robots',
  icon: 'i-carbon-bot',
  description: 'Tame the robots crawling and indexing your site with ease.',
  repo: 'nuxt-modules/robots',
  npm: '@nuxtjs/robots',
}

export const SitemapModule: NuxtSEOModule = {
  slug: 'sitemap',
  label: 'Sitemap',
  icon: 'i-carbon-load-balancer-application',
  description: 'Powerfully flexible XML Sitemaps that integrate seamlessly.',
  repo: 'nuxt-modules/sitemap',
  npm: '@nuxtjs/seo',
}

export const OgImageModule: NuxtSEOModule = {
  slug: 'og-image',
  label: 'OG Image',
  icon: 'i-carbon-image-search',
  description: 'Generate OG Images with Vue templates in Nuxt.',
  repo: 'nuxt-modules/og-image',
  npm: 'nuxt-og-image',
}

export const LinkCheckerModule: NuxtSEOModule = {
  slug: 'link-checker',
  label: 'Link Checker',
  icon: 'i-carbon-cloud-satellite-link',
  description: 'Find and magically fix links that may be negatively effecting your SEO.',
  repo: 'harlan-zw/nuxt-link-checker',
  npm: 'nuxt-link-checker',
}

export const SeoExperimentsModule: NuxtSEOModule = {
  slug: 'seo-utils',
  label: 'SEO Utils',
  icon: 'i-carbon-tools',
  description: 'SEO utilities to improve your Nuxt sites discoverability and shareability.',
  repo: 'harlan-zw/seo-utils',
  npm: 'nuxt-seo-utils',
}

export const SchemaOrgModule: NuxtSEOModule = {
  slug: 'schema-org',
  label: 'Schema.org',
  icon: 'i-carbon-chart-relationship',
  description: 'The quickest and easiest way to build Schema.org graphs.',
  repo: 'harlan-zw/nuxt-schema-org',
  npm: 'nuxt-schema-org',
}

export const modules: NuxtSEOModule[] = [
  NuxtSEO,
  RobotsModule,
  SitemapModule,
  OgImageModule,
  SchemaOrgModule,
  LinkCheckerModule,
  SeoExperimentsModule,
  SiteConfigModule,
]

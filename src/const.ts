export interface NuxtSEOModule {
  slug: 'nuxt-seo' | 'site-config' | 'robots' | 'sitemap' | 'og-image' | 'link-checker' | 'seo-utils' | 'schema-org'
  label: string
  icon: string
  description: string
  repo: string
  npm: string
  playgrounds: Record<string, string>
}

export const NuxtSEO: NuxtSEOModule = {
  slug: 'nuxt-seo',
  label: 'Nuxt SEO',
  icon: 'i-carbon-3rd-party-connected',
  description: 'The all-in-one module that brings it all together.',
  repo: 'harlan-zw/nuxt-seo',
  npm: '@nuxtjs/seo',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-zycxux?file=public%2F_robots.txt',
    i18n: 'https://stackblitz.com/edit/nuxt-starter-pnej8lvb?file=public%2F_robots.txt',
  },
}

export const SiteConfigModule: NuxtSEOModule = {
  slug: 'site-config',
  label: 'Site Config',
  icon: 'i-carbon-settings-check',
  description: 'Powerful build and runtime shared site configuration for Nuxt modules.',
  repo: 'harlan-zw/nuxt-site-config',
  npm: 'nuxt-site-config',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-zycxux?file=public%2F_robots.txt',
  },
}

export const RobotsModule: NuxtSEOModule = {
  slug: 'robots',
  label: 'Robots',
  icon: 'i-carbon-bot',
  description: 'Tame the robots crawling and indexing your site with ease.',
  repo: 'nuxt-modules/robots',
  npm: '@nuxtjs/robots',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-zycxux?file=public%2F_robots.txt',
    i18n: 'https://stackblitz.com/edit/nuxt-starter-pnej8lvb?file=public%2F_robots.txt',
  },
}

export const SitemapModule: NuxtSEOModule = {
  slug: 'sitemap',
  label: 'Sitemap',
  icon: 'i-carbon-load-balancer-application',
  description: 'Powerfully flexible XML Sitemaps that integrate seamlessly.',
  repo: 'nuxt-modules/sitemap',
  npm: '@nuxtjs/sitemap',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-dyraxc?file=server%2Fapi%2F_sitemap-urls.ts',
    i18n: 'https://stackblitz.com/edit/nuxt-starter-jwuie4?file=app.vue',
    manualChunking: 'https://stackblitz.com/edit/nuxt-starter-umyso3?file=nuxt.config.ts',
    nuxtContent: 'https://stackblitz.com/edit/nuxt-starter-a5qk3s?file=nuxt.config.ts',
  },
}

export const OgImageModule: NuxtSEOModule = {
  slug: 'og-image',
  label: 'OG Image',
  icon: 'i-carbon-image-search',
  description: 'Generate OG Images with Vue templates in Nuxt.',
  repo: 'nuxt-modules/og-image',
  npm: 'nuxt-og-image',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-pxs3wk?file=pages/index.vue',
    i18n: 'https://stackblitz.com/edit/nuxt-starter-uw7pqmxg?file=nuxt.config.ts',
    nuxtContent2: 'https://stackblitz.com/edit/github-hgunsf?file=package.json',
    nuxtContent3: 'https://stackblitz.com/edit/github-hgunsf-wd8esdec',
  },
}

export const LinkCheckerModule: NuxtSEOModule = {
  slug: 'link-checker',
  label: 'Link Checker',
  icon: 'i-carbon-cloud-satellite-link',
  description: 'Find and magically fix links that may be negatively effecting your SEO.',
  repo: 'harlan-zw/nuxt-link-checker',
  npm: 'nuxt-link-checker',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-r2wzt1?file=nuxt.config.ts',
  },
}

export const SeoUtilsModule: NuxtSEOModule = {
  slug: 'seo-utils',
  label: 'SEO Utils',
  icon: 'i-carbon-tools',
  description: 'SEO utilities to improve your Nuxt sites discoverability and shareability.',
  repo: 'harlan-zw/nuxt-seo-utils',
  npm: 'nuxt-seo-utils',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-vbay3q?file=app.vue',
  },
}

export const SchemaOrgModule: NuxtSEOModule = {
  slug: 'schema-org',
  label: 'Schema.org',
  icon: 'i-carbon-chart-relationship',
  description: 'The quickest and easiest way to build Schema.org graphs.',
  repo: 'harlan-zw/nuxt-schema-org',
  npm: 'nuxt-schema-org',
  playgrounds: {
    basic: 'https://stackblitz.com/edit/nuxt-starter-z9np1t?file=app.vue',
  },
}

export const modules: NuxtSEOModule[] = [
  NuxtSEO,
  RobotsModule,
  SitemapModule,
  OgImageModule,
  SchemaOrgModule,
  LinkCheckerModule,
  SeoUtilsModule,
  SiteConfigModule,
]

export const explicitModules = [
  RobotsModule,
  SitemapModule,
  OgImageModule,
  SchemaOrgModule,
  LinkCheckerModule,
  SeoUtilsModule,
]

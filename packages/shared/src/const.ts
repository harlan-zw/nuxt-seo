export type ChecklistItemLevel = 'required' | 'recommended'

export interface ChecklistItemDefinition {
  /** Unique ID within its module, e.g. 'site-url' */
  id: string
  /** Human-readable label */
  label: string
  /** Why this matters */
  description: string
  level: ChecklistItemLevel
  /** URL to relevant docs */
  docsUrl: string
}

export interface NuxtSEOModule {
  slug: 'nuxt-seo' | 'site-config' | 'robots' | 'sitemap' | 'og-image' | 'link-checker' | 'seo-utils' | 'schema-org' | 'skew-protection' | 'ai-ready' | 'ai-kit'
  label: string
  icon: string
  description: string
  repo: string
  npm: string
  playgrounds?: Record<string, string>
}

export const NuxtSEO: NuxtSEOModule = {
  slug: 'nuxt-seo',
  label: 'Nuxt SEO',
  icon: 'i-carbon-3rd-party-connected',
  description: 'The all-in-one module that brings it all together.',
  repo: 'harlan-zw/nuxt-seo',
  npm: '@nuxtjs/seo',
  playgrounds: {
    basic: 'https://stackblitz.com/github/harlan-zw/nuxt-seo/tree/main/examples/basic',
    i18n: 'https://stackblitz.com/github/harlan-zw/nuxt-seo/tree/main/examples/i18n',
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
    'basic': 'https://stackblitz.com/github/harlan-zw/nuxt-site-config/tree/main/examples/basic',
    'env-driven': 'https://stackblitz.com/github/harlan-zw/nuxt-site-config/tree/main/examples/env-driven',
    'multi-site': 'https://stackblitz.com/github/harlan-zw/nuxt-site-config/tree/main/examples/multi-site',
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
    'basic': 'https://stackblitz.com/github/nuxt-modules/robots/tree/main/examples/basic',
    'i18n': 'https://stackblitz.com/github/nuxt-modules/robots/tree/main/examples/i18n',
    'custom-rules': 'https://stackblitz.com/github/nuxt-modules/robots/tree/main/examples/custom-rules',
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
    'basic': 'https://stackblitz.com/github/nuxt-modules/sitemap/tree/main/examples/basic',
    'i18n': 'https://stackblitz.com/github/nuxt-modules/sitemap/tree/main/examples/i18n',
    'dynamic-urls': 'https://stackblitz.com/github/nuxt-modules/sitemap/tree/main/examples/dynamic-urls',
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
    'basic-satori': 'https://stackblitz.com/github/nuxt-modules/og-image/tree/main/examples/basic-satori',
    'basic-takumi': 'https://stackblitz.com/github/nuxt-modules/og-image/tree/main/examples/basic-takumi',
    'content': 'https://stackblitz.com/github/nuxt-modules/og-image/tree/main/examples/content',
    'i18n': 'https://stackblitz.com/github/nuxt-modules/og-image/tree/main/examples/i18n',
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
    'basic': 'https://stackblitz.com/github/harlan-zw/nuxt-link-checker/tree/main/examples/basic',
    'broken-links': 'https://stackblitz.com/github/harlan-zw/nuxt-link-checker/tree/main/examples/broken-links',
    'skip-inspection': 'https://stackblitz.com/github/harlan-zw/nuxt-link-checker/tree/main/examples/skip-inspection',
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
    'basic': 'https://stackblitz.com/github/harlan-zw/nuxt-seo-utils/tree/main/examples/basic',
    'breadcrumbs': 'https://stackblitz.com/github/harlan-zw/nuxt-seo-utils/tree/main/examples/breadcrumbs',
    'meta-tags': 'https://stackblitz.com/github/harlan-zw/nuxt-seo-utils/tree/main/examples/meta-tags',
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
    'basic': 'https://stackblitz.com/github/harlan-zw/nuxt-schema-org/tree/main/examples/basic',
    'blog': 'https://stackblitz.com/github/harlan-zw/nuxt-schema-org/tree/main/examples/blog',
    'e-commerce': 'https://stackblitz.com/github/harlan-zw/nuxt-schema-org/tree/main/examples/e-commerce',
  },
}

export const SkewProtectionModule: NuxtSEOModule = {
  slug: 'skew-protection',
  npm: 'nuxt-skew-protection',
  repo: 'nuxt-seo-pro/nuxt-skew-protection',
  description: 'Solve Nuxt version skews with persistent assets and instant updates.',
  label: 'Skew Protection',
  icon: 'i-carbon-version',
}

export const AiReadyModule: NuxtSEOModule = {
  slug: 'ai-ready',
  npm: 'nuxt-ai-ready',
  repo: 'nuxt-seo-pro/nuxt-ai-ready',
  description: 'Best practice AI & LLM discoverability for Nuxt sites.',
  label: 'AI Ready',
  icon: 'i-carbon-ai-label',
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
  SkewProtectionModule,
  AiReadyModule,
]

export const bundledModules = [
  RobotsModule,
  SitemapModule,
  OgImageModule,
  SchemaOrgModule,
  LinkCheckerModule,
  SeoUtilsModule,
]

export const standaloneModules = [
  SkewProtectionModule,
  AiReadyModule,
]

/** @deprecated Use `bundledModules` */
export const normalModules = bundledModules
/** @deprecated Use `standaloneModules` */
export const proModules = standaloneModules

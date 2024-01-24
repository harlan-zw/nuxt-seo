import { $fetch } from 'ofetch'
import { readPackageJSON } from 'pkg-types'
import NuxtSeo from '../src/module'
import { version } from '../package.json'
import {
  LinkCheckerModule,
  OgImageModule,
  RobotsModule,
  SchemaOrgModule,
  SeoExperimentsModule,
  SeoModules,
  SiteConfigModule,
  SitemapModule,
} from './utils/data'

export default defineNuxtConfig({
  extends: [
    'nuxt-lego',
    '@nuxt/ui-pro',
  ],
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxt/content',
    'nuxt-lodash',
    'nuxt-icon',
    'nuxt-og-image',
    NuxtSeo,
    async (_, nuxt) => {
      const uniqueContributors = new Set()
      nuxt.options.runtimeConfig.public.moduleStats = (await Promise.all(
        [...SeoModules]
          .filter(m => !m.unlisted || m.id === 'seo-kit')
          .map(m => m.id)
          .map(m =>
            $fetch(`https://api.nuxt.com/modules/${m}`)
              .then((d) => {
                if (d.contributors)
                  d.contributors.forEach(c => uniqueContributors.add(c.id))
                return { id: m, stats: d.stats || false }
              }),
          ),
      )).filter(d => d.stats)
      const pkgJson = await readPackageJSON('../package.json')
      nuxt.options.runtimeConfig.public.moduleDeps = pkgJson.dependencies
      nuxt.options.runtimeConfig.public.totalContributors = uniqueContributors.size
      nuxt.options.runtimeConfig.public.uniqueContributors = [...uniqueContributors]
    },
  ],
  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.',
    tagline: 'All the boring SEO stuff for Nuxt done.',
  },
  runtimeConfig: {
    public: {
      version,
    },
  },
  content: {
    highlight: {
      theme: {
        light: 'github-light',
        default: 'github-light',
        dark: 'material-theme-palenight',
      },
      preload: [
        'ts',
        'vue',
        'json',
        'html',
        'bash',
      ],
    },
  },
  devtools: {
    enabled: true,
  },
  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons', 'ph', 'noto'],
  },
  sitemap: {
    strictNuxtContentPaths: true,
    xslColumns: [
      { label: 'URL', width: '50%' },
      { label: 'Last Modified', select: 'sitemap:lastmod', width: '25%' },
      { label: 'Priority', select: 'sitemap:priority', width: '12.5%' },
      { label: 'Change Frequency', select: 'sitemap:changefreq', width: '12.5%' },
    ],
  },
  routeRules: {
    // for doc linking purposes
    '/robots': { redirect: { to: '/robots/getting-started/installation', statusCode: 301 } },
    '/sitemap': { redirect: { to: '/sitemap/getting-started/installation', statusCode: 301 } },
    '/og-image': { redirect: { to: '/og-image/getting-started/installation', statusCode: 301 } },
    '/schema-org': { redirect: { to: '/schema-org/getting-started/installation', statusCode: 301 } },
    '/experiments': { redirect: { to: '/experiments/getting-started/installation', statusCode: 301 } },
    '/site-config': { redirect: { to: '/site-config/getting-started/installation', statusCode: 301 } },
    '/link-checker': { redirect: { to: '/link-checker/getting-started/installation', statusCode: 301 } },

    // defaults
    '/site-config/**': SiteConfigModule.routeRules,
    '/robots/**': RobotsModule.routeRules,
    '/sitemap/**': SitemapModule.routeRules,
    '/og-image/**': OgImageModule.routeRules,
    '/schema-org/**': SchemaOrgModule.routeRules,
    '/experiments/**': SeoExperimentsModule.routeRules,
    '/link-checker/**': LinkCheckerModule.routeRules,
    // extra redirects
    '/sitemap/guides/i18n': { redirect: { to: '/sitemap/integrations/i18n', statusCode: 301 } },
    '/sitemap/guides/integrations': { redirect: { to: '/sitemap/integrations/content', statusCode: 301 } },
    '/sitemap/guides/auto-lastmod': { redirect: { to: '/sitemap/guides/best-practices', statusCode: 301 } },
    '/nuxt-seo/getting-started/migration-guide': { redirect: { to: '/nuxt-seo/migration-guide/nuxt-seo-kit', statusCode: 301 } },
  },
  css: [
    '~/css/scrollbars.css',
  ],
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    seoMeta: {
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
    },
    head: {
      templateParams: {
        separator: '·',
      },
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&family=Plus+Jakarta+Sans:wght@600&display=swap' },
      ],

      bodyAttrs: {
        class: 'antialiased font-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900',
      },

      script: [
        {
          'src': 'https://cdn.usefathom.com/script.js',
          'data-spa': 'auto',
          'data-site': 'KGILBQDV',
          'defer': true,
        },
      ],
    },
  },
  generate: {
    routes: ['/'],
  },
})

import { $fetch } from 'ofetch'
import { readPackageJSON } from 'pkg-types'
import NuxtSeo from '../module/src/module'
import { version } from '../module/package.json'
import {
  LinkCheckerModule,
  OgImageModule,
  RobotsModule,
  SchemaOrgModule,
  SeoExperimentsModule,
  SeoModules,
  SeoUiModule,
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
      nuxt.options.runtimeConfig.public.moduleStats = (await Promise.all(
        [...SeoModules, { id: 'seo-kit' }]
          .filter(m => !m.unlisted)
          .map(m => m.id)
          .map(m =>
            $fetch(`https://api.nuxt.com/modules/${m}`)
              .then(d => ({ id: m, stats: d.stats || false })),
          ),
      )).filter(d => d.stats)
      const pkgJson = await readPackageJSON('../module/package.json')
      nuxt.options.runtimeConfig.public.moduleDeps = pkgJson.dependencies
    },
  ],
  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.',
    tagline: 'All the boring SEO stuff for Nuxt done.',
    titleSeparator: '·',
  },
  linkChecker: { enabled: false },
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
    },
  },
  devtools: {
    enabled: true,
  },
  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons', 'ph', 'noto'],
  },
  seoUi: {
    global: true,
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
    '/ui/**': SeoUiModule.routeRules,
    // extra redirects
    '/sitemap/guides/i18n': { redirect: { to: '/sitemap/integrations/i18n', statusCode: 301 } },
    '/sitemap/guides/integrations': { redirect: { to: '/sitemap/integrations/content', statusCode: 301 } },
    '/sitemap/guides/auto-lastmod': { redirect: { to: '/sitemap/guides/best-practices', statusCode: 301 } },

  },
  // ogImage: {
  //   defaults: {
  //     extension: 'png',
  //   },
  // },
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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600&display=swap' },
        { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
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
  hooks: {
    // Related to https://github.com/nuxt/nuxt/pull/22558
    // Adding all global components to the main entry
    // To avoid lagging during page navigation on client-side
    // Downside: bigger JS bundle
    // With sync: 465KB, gzip: 204KB
    // Without: 418KB, gzip: 184KB
    'components:extend': function (components) {
      for (const comp of components) {
        if (comp.global)
          comp.global = 'sync'
      }
    },
  },
})

import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'pathe'
import NuxtSEO from '../src/module'

export default defineNuxtConfig({
  // const pkgJson = await readPackageJSON('../package.json')
  modules: [
    '@vueuse/motion/nuxt',
    '@nuxt/ui',
    '@nuxt/ui-pro',
    'nuxt-content-twoslash',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    'nuxt-rebundle',
    '@nuxthub/core',
    '@nuxt/fonts',
    '@nuxt/content',
    // 'nuxt-build-cache',
    '@nuxt/scripts',
    '@nuxt/image',
    NuxtSEO,
    async (_, nuxt) => {
      nuxt.hooks.hook('nitro:init', (nitro) => {
        // from sponsorkit
        nitro.options.alias.sharp = 'unenv/runtime/mock/empty'
        nitro.options.alias.pnpapi = 'unenv/runtime/mock/empty' // ?
        nitro.options.alias['#content/server'] = resolve('./server/content-v2')
      })
    },
  ],

  ui: {
    theme: {
      transitions: true,
    },
  },

  robots: {
    enabled: false,
  },

  sitemap: {
    enabled: false,
  },

  hub: {
    database: true,
    cache: true,
    kv: true,
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    emailOctopusToken: '', // NUXT_EMAIL_OCTOPUS_TOKEN
    githubAccessToken: '', // NUXT_GITHUB_ACCESS_TOKEN
    githubAuthToken: '', // NUXT_GITHUB_AUTH_TOKEN
    githubAuthClientId: 'cabace556bd9519d9299', // NUXT_GITHUB_AUTH_CLIENT_ID
    githubAuthClientSecret: '', // NUXT_GITHUB_AUTH_SECRET_ID

    public: {
      // moduleDeps: pkgJson.dependencies,
      // version: pkgJson.version,
    },
  },

  twoslash: {
    floatingVueOptions: {
      classMarkdown: 'prose prose-primary dark:prose-invert bg-blue-500',
    },
    // Skip Twoslash in dev to improve performance. Turn this on when you want to explictly test twoslash in dev.
    enableInDev: false,
    // Do not throw when twoslash fails, the typecheck should be down in github.com/nuxt/nuxt's CI
    throws: false,
  },

  fonts: {
    experimental: {
      processCSSVariables: true,
    },
    families: [
      { name: 'Hubot Sans', provider: 'local', weight: [200, 900], stretch: '75% 125%' },
    ],
  },

  nitro: {
    experimental: {
      wasm: true,
    },
    prerender: {
      failOnError: false,
      crawlLinks: true,
      routes: ['/'],
    },
  },

  experimental: {
    headNext: true,
    sharedPrerenderData: true,
    appManifest: true,
  },

  site: {
    url: 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.',
    tagline: 'All the boring SEO stuff for Nuxt done.',
  },

  imports: {
    autoImport: true,
  },

  typescript: {
    strict: false,
    includeWorkspace: true,
  },

  alias: {
    '#content/server': resolve('./server/content-v2'),
  },

  content: {
    database: { type: 'd1', binding: 'DB' },
    build: {
      markdown: {
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
    },
  },

  devtools: {
    enabled: true,
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  sitemap: {
    strictNuxtContentPaths: true,
    xslColumns: [
      { label: 'URL', width: '100%' },
    ],
  },

  mdc: {
    highlight: {
      theme: {
        light: 'github-light',
        default: 'github-light',
        dark: 'material-theme-palenight',
      },
      langs: [
        'ts',
        'vue',
        'json',
        'html',
        'bash',
        'xml',
        'diff',
        'md',
        'dotenv',
      ],
    },
  },

  $production: {
    routeRules: {
      '/api/_mdc/highlight': { cache: { group: 'mdc', name: 'highlight', maxAge: 60 * 60 } },
      '/api/_content/query/**': { cache: { group: 'content', name: 'query', maxAge: 60 * 60 } }
    },
    scripts: {
      registry: {
        fathomAnalytics: {
          site: 'KGILBQDV',
        },
      },
    },
  },

  routeRules: {
    // for doc linking purposes
    '/robots': { redirect: { to: '/docs/robots/getting-started/installation', statusCode: 301 } },
    '/sitemap': { redirect: { to: '/docs/sitemap/getting-started/installation', statusCode: 301 } },
    '/og-image': { redirect: { to: '/docs/og-image/getting-started/installation', statusCode: 301 } },
    '/schema-org': { redirect: { to: '/docs/schema-org/getting-started/installation', statusCode: 301 } },
    '/experiments': { redirect: { to: '/docs/seo-utils/getting-started/installation', statusCode: 301 } },
    '/site-config': { redirect: { to: '/docs/site-config/getting-started/installation', statusCode: 301 } },
    '/link-checker': { redirect: { to: '/docs/link-checker/getting-started/installation', statusCode: 301 } },

    // defaults
    // '/site-config/**': SiteConfigModule.routeRules,
    // '/robots/**': RobotsModule.routeRules,
    // '/sitemap/**': SitemapModule.routeRules,
    // '/og-image/**': OgImageModule.routeRules,
    // '/schema-org/**': SchemaOrgModule.routeRules,
    // '/experiments/**': SeoExperimentsModule.routeRules,
    // '/link-checker/**': LinkCheckerModule.routeRules,
    '/nuxt-seo/**': {
      ogImage: {
        component: 'NuxtSeo',
      },
    },
    '/og-image/releases/v3': { redirect: { to: '/docs/og-image/releases/v3-major', statusCode: 301 } },
    // extra redirects
    '/sitemap/guides/i18n': { redirect: { to: '/docs/sitemap/integrations/i18n', statusCode: 301 } },
    '/sitemap/guides/integrations': { redirect: { to: '/docs/sitemap/integrations/content', statusCode: 301 } },
    '/sitemap/guides/auto-lastmod': { redirect: { to: '/docs/sitemap/guides/best-practices', statusCode: 301 } },
    '/nuxt-seo/getting-started/migration-guide': {
      redirect: {
        to: '/docs/nuxt-seo/migration-guide/nuxt-seo-kit',
        statusCode: 301,
      },
    },

    // v2 redirects
    '/docs/seo-utils/guides/redirect-canonical': { redirect: { to: '/docs/seo-utils/guides/canonical-url', statusCode: 301 } },

    '/docs/sitemap/getting-started/faq': { redirect: { to: '/docs/sitemap/getting-started/troubleshooting', statusCode: 301 } },
    '/docs/sitemap/integrations/robots': { redirect: { to: '/docs/sitemap/getting-started/installation', statusCode: 301 } },
    '/docs/sitemap/guides/lastmod': { redirect: { to: '/docs/sitemap/guides/loc-data', statusCode: 301 } },
    '/docs/sitemap/guides/cache': { redirect: { to: '/docs/sitemap/guides/performance', statusCode: 301 } },
    '/docs/sitemap/guides/debugging': { redirect: { to: '/docs/sitemap/getting-started/troubleshooting', statusCode: 301 } },
    '/docs/sitemap/integrations/content': { redirect: { to: '/docs/sitemap/guides/content', statusCode: 301 } },
    '/docs/sitemap/api/schema': { redirect: { to: '/docs/sitemap/guides/images-videos', statusCode: 301 } },

    '/docs/robots/getting-started/how-it-works': { redirect: { to: '/docs/robots/guides/how-it-works', statusCode: 301 } },
    '/docs/robots/integration/i18n': { redirect: { to: '/docs/robots/guides/i18n', statusCode: 301 } },
    '/docs/robots/nitro-api/get-site-indexable': { redirect: { to: '/docs/robots/nitro-api/get-site-robot-config', statusCode: 301 } },

    '/docs/link-checker/integrations/sitemap': { redirect: { to: '/docs/link-checker/getting-started/installation', statusCode: 301 } },

    '/docs/schema-org/integrations/robots': { redirect: { to: '/docs/schema-org/getting-started/installation', statusCode: 301 } },
    '/docs/schema-org/getting-started/how-it-works': { redirect: { to: '/docs/schema-org/guides/how-it-works', statusCode: 301 } },
    '/docs/schema-org/integrations/i18n': { redirect: { to: '/docs/schema-org/guides/i18n', statusCode: 301 } },
    '/docs/schema-org/guides/debugging': { redirect: { to: '/docs/schema-org/getting-started/troubleshooting', statusCode: 301 } },

    '/docs/og-image/api/nuxt-seo-template': { redirect: { to: '/docs/og-image/guides/community-templates', statusCode: 301 } },

    '/docs/site-config/getting-started/how-it-works': { redirect: { to: '/docs/site-config/guides/how-it-works', statusCode: 301 } },
    '/docs/site-config/integrations/i18n': { redirect: { to: '/docs/site-config/integrations/i18n', statusCode: 301 } },
    '/docs/site-config/guides/debugging': { redirect: { to: '/docs/site-config/getting-started/troubleshooting', statusCode: 301 } },

    '/docs/nuxt-seo/getting-started/what-is-nuxt-seo': { redirect: { to: '/docs/nuxt-seo/getting-started/introduction', statusCode: 301 } },
    '/docs/nuxt-seo/getting-started/faq': { redirect: { to: '/docs/nuxt-seo/getting-started/troubleshooting', statusCode: 301 } },
    '/docs/nuxt-seo/guides/default-meta': { redirect: { to: '/docs/seo-utils/guides/default-meta', statusCode: 301 } },
    '/docs/nuxt-seo/guides/fallback-title': { redirect: { to: '/docs/seo-utils/guides/fallback-title', statusCode: 301 } },
    '/docs/nuxt-seo/guides/redirect-canonical': { redirect: { to: '/docs/seo-utils/guides/canonical-url', statusCode: 301 } },
    '/docs/nuxt-seo/guides/title-templates': { redirect: { to: '/learn/mastering-titles-in-nuxt', statusCode: 301 } },
    '/docs/nuxt-seo/guides/trailing-slashes': { redirect: { to: '/learn/trailing-slashes', statusCode: 301 } },
    '/docs/nuxt-seo/guides/i18n': { redirect: { to: '/docs/nuxt-seo/getting-started/introduction', statusCode: 301 } },
    '/docs/nuxt-seo/seo-guides/going-live': { redirect: { to: '/learn/going-live', statusCode: 301 } },
    '/docs/nuxt-seo/api/breadcrumbs': { redirect: { to: '/docs/seo-utils/api/breadcrumbs', statusCode: 301 } },
    '/docs/nuxt-seo/api/config': { redirect: { to: '/docs/nuxt-seo/getting-started/introduction', statusCode: 301 } },
    '/docs/nuxt-seo/guides/configuring-modules': { redirect: { to: '/docs/nuxt-seo/guides/using-the-modules', statusCode: 301 } },
  },

  css: [
    '~/css/scrollbars.css',
  ],

  ogImage: {
    zeroRuntime: true,
    strictNuxtContentPaths: true,
  },

  icon: {
    customCollections: [{
      prefix: 'custom',
      dir: resolve('./app/assets/icons'),
    }],
    clientBundle: {
      scan: true,
      includeCustomCollections: true,
    },
    // provider: 'iconify',
    fallbackToApi: 'client-only',
  },

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
    head: {
      seoMeta: {
        themeColor: [
          { content: '#18181b', media: '(prefers-color-scheme: dark)' },
          { content: 'white', media: '(prefers-color-scheme: light)' },
        ],
      },
      templateParams: {
        separator: '·',
      },

      bodyAttrs: {
        class: 'antialiased font-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900',
      },

    },
  },

  compatibilityDate: '2024-07-12',
})

import { existsSync } from 'node:fs'
import * as fs from 'node:fs'
import { globby } from 'globby'
import { defineNuxtConfig } from 'nuxt/config'
import { relative, resolve } from 'pathe'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { modules } from '../src/const'
import NuxtSEO from '../src/module'
import { logger } from './logger'

export default defineNuxtConfig({
  // const pkgJson = await readPackageJSON('../package.json')
  modules: [
    '@vueuse/motion/nuxt',
    '@nuxt/ui',
    '@nuxt/ui-pro',
    'nuxt-content-twoslash',
    'radix-vue/nuxt',
    '@vueuse/nuxt',
    '@nuxt/fonts',
    '@nuxt/content',
    // 'nuxt-build-cache',
    '@nuxt/scripts',
    '@nuxt/image',
    NuxtSEO,
    async (_, nuxt) => {
      nuxt.hooks.hook('nitro:init', (nitro) => {
        nitro.options.alias['#content/server'] = resolve('./server/content-v2')
      })
      if (existsSync(resolve(__dirname, '.content'))) {
        return
      }
      const lnContentStorage = createStorage({
        driver: fsDriver({
          base: resolve(__dirname, '.content'),
        }),
      })
      let key = 0
      for (const m of modules) {
        const localDirPaths = [
          resolve(__dirname, '..', '..', m.npm, 'docs', 'content'),
          resolve(__dirname, '..', '..', m.repo.replace('harlan-zw/', '').replace('nuxt-modules/', ''), 'docs', 'content'),
        ]
        for (const localDirPath of localDirPaths) {
          if (existsSync(localDirPath)) {
            logger.info(`🔗 Docs source \`${m.slug}\` using local fs: ${relative(process.cwd(), localDirPath)}`)
            // copy all files within localDirPath to .content/${key}.${m.slug}
            // read all files
            const files = await globby('**/*.md', { cwd: localDirPath })
            for (const f of files) {
              const content = await fs.promises.readFile(resolve(localDirPath, f), { encoding: 'utf-8' })
              await lnContentStorage.set(`${key}.${m.slug}/${f}`, content)
            }
            // return [camelCase(m.slug), defineCollection({
            //   type: 'page',
            //   source: {
            //     cwd: localDirPath,
            //     path: '**/*.md',
            //     prefix: `docs/${key}.${m.slug}`,
            //   },
            // })]
          }
          else {
            logger.info(`🔗 Docs source \`${m.slug}\` using GitHub: ${m.repo}`)
          }
        }
        key++
        // return [camelCase(m.slug), defineCollection({
        //   type: 'page',
        //   source: {
        //     path: '',
        //     prefix: `/docs/${key}.${m.slug}`,
        //     repository: `https://github.com/nuxt-modules/sitemap/tree/main/docs/content`,
        //   },
        //   // token: process.env.NUXT_GITHUB_TOKEN || '',
        //   // driver: 'github',
        //   // dir: 'docs/content',
        // })]
      }
    },
  ],

  ui: {
    theme: {
      transitions: true,
    },
  },

  future: {
    compatibilityVersion: 4,
  },

  runtimeConfig: {
    githubToken: '', // NUXT_GITHUB_TOKEN
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

  nitro: {
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
    '#content/server': resolve('./app/utils/content-v2'),
  },

  content: {
    // highlight: {
    //   theme: {
    //     light: 'github-light',
    //     default: 'github-light',
    //     dark: 'material-theme-palenight',
    //   },
    //   preload: [
    //     'ts',
    //     'vue',
    //     'json',
    //     'html',
    //     'bash',
    //   ],
    // },
    // sources: {
    //   // ...Object.fromEntries(
    //   //   modules
    //   //     .filter(m => m.slug !== 'nuxt-seo')
    //   //     .map((m, key) => {
    //   //       const localDirPaths = [
    //   //         resolve(__dirname, '..', '..', m.npm, 'docs', 'content'),
    //   //         resolve(__dirname, '..', '..', m.repo.replace('harlan-zw/', '').replace('nuxt-modules/', ''), 'docs', 'content'),
    //   //       ]
    //   //       if (isDevelopment) {
    //   //         for (const localDirPath of localDirPaths) {
    //   //           if (existsSync(localDirPath)) {
    //   //             logger.info(`🔗 Docs source \`${m.slug}\` using local fs: ${relative(process.cwd(), localDirPath)}`)
    //   //             return [m.slug, {
    //   //               watch: true,
    //   //               prefix: `/docs/${key}.${m.slug}`,
    //   //               driver: 'fs',
    //   //               base: localDirPath,
    //   //             }]
    //   //           }
    //   //         }
    //   //       }
    //   //       logger.info(`🔗 Docs source \`${m.slug}\` using GitHub: ${m.repo}`)
    //   //       return [m.slug, {
    //   //         token: process.env.NUXT_GITHUB_TOKEN || '',
    //   //         prefix: `/docs/${key}.${m.slug}`,
    //   //         driver: 'github',
    //   //         repo: m.repo,
    //   //         branch: 'main',
    //   //         dir: 'docs/content',
    //   //       }]
    //   //     }),
    //   // ),
    //   nuxtSeo: {
    //     watch: true,
    //     driver: 'fs',
    //     prefix: '/docs/nuxt-seo',
    //     base: resolve(__dirname, 'content', 'nuxt-seo'),
    //   },
    // },
  },

  devtools: {
    enabled: true,
  },

  sitemap: {
    strictNuxtContentPaths: true,
    xslColumns: [
      { label: 'URL', width: '100%' },
    ],
  },

  mdc: {
    highlight: {
      langs: [
        'ts',
        'vue',
        'json',
        'html',
        'bash',
        'xml',
        'diff',
        'md',
      ],
    },
  },

  routeRules: {
    // for doc linking purposes
    '/robots': { redirect: { to: '/docs/robots/getting-started/installation', statusCode: 301 } },
    '/sitemap': { redirect: { to: '/docs/sitemap/getting-started/installation', statusCode: 301 } },
    '/og-image': { redirect: { to: '/docs/og-image/getting-started/installation', statusCode: 301 } },
    '/schema-org': { redirect: { to: '/docs/schema-org/getting-started/installation', statusCode: 301 } },
    '/experiments': { redirect: { to: '/docs/experiments/getting-started/installation', statusCode: 301 } },
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
  },

  css: [
    '~/css/scrollbars.css',
  ],

  $production: {
    scripts: {
      registry: {
        fathomAnalytics: {
          site: 'KGILBQDV',
        },
      },
    },
  },

  ogImage: {
    strictNuxtContentPaths: true,
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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&family=Plus+Jakarta+Sans:wght@600&display=swap',
        },
      ],

      bodyAttrs: {
        class: 'antialiased font-sans text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900',
      },

    },
  },

  compatibilityDate: '2024-07-12',
})

import colors from 'tailwindcss/colors'
import NuxtSeo from '../module/src/module'
import { excludeColors } from './colors'
import { version } from './package.json'

delete colors.lightBlue
delete colors.warmGray
delete colors.trueGray
delete colors.coolGray
delete colors.blueGray

export default defineNuxtConfig({
  extends: [
    'nuxt-lego',
  ],
  modules: [
    '@nuxthq/ui',
    '@vueuse/nuxt',
    '@nuxt/content',
    'nuxt-lodash',
    'nuxt-icon',
    process.dev ? '' : 'nuxt-component-meta',
    NuxtSeo,
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
        light: 'material-lighter',
        default: 'material-default',
        dark: 'material-palenight',
      },
      preload: ['json', 'js', 'ts', 'html', 'css', 'vue', 'diff', 'shell', 'markdown', 'yaml', 'bash', 'ini'],
    },
  },
  devtools: {
    enabled: false,
  },
  ui: {
    global: true,
    icons: ['heroicons', 'simple-icons'],
    safelistColors: excludeColors(colors),
  },
  sitemap: {
    debug: true,
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
    '/og-image': { redirect: { to: '/og-image/getting-started/installation', statusCode: 301 } },
    '/experiments': { redirect: { to: '/experiments/getting-started/installation', statusCode: 301 } },
    '/robots': { redirect: { to: '/robots/getting-started/installation', statusCode: 301 } },
    '/sitemap': { redirect: { to: '/sitemap/getting-started/installation', statusCode: 301 } },
  },
  app: {
    seoMeta: {
      viewport: {
        width: 'device-width',
        initialScale: '1',
        maximumScale: '1',
      },
      themeColor: [
        { content: '#18181b', media: '(prefers-color-scheme: dark)' },
        { content: 'white', media: '(prefers-color-scheme: light)' },
      ],
    },
    head: {
      titleTemplate: '%s %separator %site.name',
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
  typescript: {
    strict: false,
    includeWorkspace: true,
  },
  generate: {
    routes: ['/'],
  },
  componentMeta: {
    globalsOnly: true,
    debug: true,
    metaFields: {
      props: false,
      slots: false,
      events: false,
      exposed: false,
    },
  },
})

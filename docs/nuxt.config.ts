import { excludeColors } from './colors'
import NuxtSeo from '../module/src/module'
import { version } from './package.json'
import colors from 'tailwindcss/colors'

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
    url: 'https://nuxt-seo.netlify.app/', // 'https://nuxtseo.com',
    name: 'Nuxt SEO',
    description: 'Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.',
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
  routeRules: {
    // for doc linking purposes
    '/og-image': { redirect: { to: '/og-image/getting-started/installation', statusCode: 301 } },
    '/experiments': { redirect: { to: '/experiments/getting-started/installation', statusCode: 301 } },
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600&display=swap' },
      ],
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

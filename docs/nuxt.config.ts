export default defineNuxtConfig({
  extends: [
    '@nuxt-themes/docus',
  ],

  runtimeConfig: {
    indexable: true,
    public: {
      titleSeparator: '·',
      siteUrl: 'https://nuxt-seo-kit.harlanzw.com/',
      siteName: 'Nuxt SEO Kit',
      trailingSlash: false,
      siteDescription: 'The All-in-One SEO module for Nuxt.',
      language: 'en',
    },
  },

  // vite: {
  //   server: {
  //     fs: {
  //       allow: ['..'],
  //     }
  //   }
  // },

  modules: [
    'nuxt-seo-kit-module',
    'nuxt-windicss',
    '@nuxtjs/fontaine',
  ],

  pinceau: {
    debug: true,
    followSymbolicLinks: false,
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/logo.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:no-preference)' },
        { rel: 'icon', href: '/logo-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:dark)' },
        { rel: 'icon', href: '/logo-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme:light)' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin: true },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' },
      ],
      script: [
        {
          'src': 'https://cdn.usefathom.com/script.js',
          'data-spa': 'auto',
          'data-site': 'BRDEJWKJ',
          'defer': true,
        },
      ],
    },
  },
  //
  fontMetrics: {
    fonts: ['Inter'],
  },
})

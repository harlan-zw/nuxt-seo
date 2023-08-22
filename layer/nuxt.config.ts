import { useLogger } from '@nuxt/kit'

export default ({
  modules: [
    '@nuxtseo/module',
  ],

  hooks: {
    'modules:done': function () {
      const logger = useLogger()
      logger.warn('Using Nuxt SEO Kit as a layer has been deprecated. Please use `@nuxtseo/module` as module instead.')
    },
  },
  //
  // nitro: {
  //   prerender: {
  //     crawlLinks: true,
  //     routes: [
  //       '/',
  //     ],
  //   },
  // },
  //
  // linkChecker: {
  //   failOn404: false,
  // },
  //
  // experimental: {
  //   componentIslands: true,
  // },
  //
  // runtimeConfig: {
  //   indexable: typeof process.env.NUXT_INDEXABLE !== 'undefined' ? String(process.env.NUXT_INDEXABLE) !== 'false' : process.env.NODE_ENV === 'production',
  //   public: {
  //     trailingSlash: String(process.env.NUXT_PUBLIC_TRAILING_SLASH) === 'true',
  //     titleSeparator: process.env.NUXT_PUBLIC_TITLE_SEPARATOR || '|',
  //     siteName: process.env.NUXT_PUBLIC_SITE_NAME,
  //     siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000/',
  //     siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION,
  //     language: process.env.NUXT_PUBLIC_LANGUAGE || 'en',
  //   },
  // },
  //
  // components: [
  //   {
  //     prefix: '',
  //     path: resolve('./components'),
  //   },
  // ],
})

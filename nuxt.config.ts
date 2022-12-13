import { createResolver, logger } from '@nuxt/kit'
import { version, name } from './package.json'

const { resolve } = createResolver(import.meta.url)


export default defineNuxtConfig({
  modules: [
    'nuxt-schema-org',
    'nuxt-unhead',
    resolve('./modules/nuxt-simple-sitemap/module'),
    resolve('./modules/nuxt-seo-kit/module'),
    async (_, nuxt) => {

      if (nuxt.options.dev) {
        logger.success(`Using ${name} v${version}`)

        // $fetch('https://ungh.unjs.io/repos/nuxt-themes/scribe/releases/latest').then(({ release }) => {
        //   if (release.tag !== `v${version}`) {
        //     logger.warn(`A new version of Scribe (${release.tag}) is available: https://github.com/nuxt-themes/scribe/releases/tag/${release.tag}`)
        //   }
        // }).catch((_) => {})
      }
    },
  ],

  nitro: {
    routeRules: {
      '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } }
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/robots.txt',
        '/sitemap.xml',
        '/feed.xml',
        '/feed.json',
        '/feed.atom',
      ],
    },
  },

  components: [
    {
      prefix: '',
      path: resolve('./components'),
      global: true
    }
  ],
})

import {NuxtConfig} from "@nuxt/schema";
import {NitroRouteRules} from "nitropack";

const routeRules : NitroRouteRules = {
  indexable: false,
  sitemap: {
    changefreq: 'daily',
  }
}
export default defineNuxtConfig(<NuxtConfig> {
    extends: ['nuxt-seo-kit'],

  site: {
    host: 'https://harlanzw.com',
  },

  runtimeConfig: {
    host: 'https://harlanzw.com',
  },

  routeRules: {
    '/about': { sitemap: { changefreq: 'daily', priority: 0.3 } }
  }
})

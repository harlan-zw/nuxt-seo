export default defineNuxtConfig({
  site: {
    name: 'Nuxt SEO Compatibility',
    description: 'Nuxt SEO compatibility fixture.',
    url: 'https://compat.example.com',
  },

  sitemap: {
    credits: false,
  },

  ogImage: {
    security: {
      secret: 'nuxtseo-compatibility-fixture-secret',
    },
  },

  devtools: { enabled: false },
  compatibilityDate: '2026-06-10',
})

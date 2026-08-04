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
    debug: true,
    security: {
      secret: false,
    },
  },

  devtools: { enabled: false },
  compatibilityDate: '2026-06-10',
})

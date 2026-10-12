export default defineNuxtConfig({
  modules: [
    '@nuxtjs/seo',
    '@nuxt/content',
  ],

  site: {
    url: 'https://example.com',
    name: 'Awesome Blog',
    description: 'A blog powered by Nuxt Content and @nuxtjs/seo.',
  },

  compatibilityDate: '2026-10-01',
})

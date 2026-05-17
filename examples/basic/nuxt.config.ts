export default defineNuxtConfig({
  modules: ['@nuxtjs/seo'],

  site: {
    url: 'https://example.com',
    name: 'Awesome Site',
    description: 'Welcome to my awesome site.',
    defaultLocale: 'en',
  },

  compatibilityDate: '2024-08-07',
})

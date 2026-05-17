export default defineNuxtConfig({
  modules: [
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
  ],

  site: {
    url: 'https://example.com',
    name: 'Awesome Site',
    description: 'Welcome to my awesome site.',
  },

  i18n: {
    baseUrl: 'https://example.com',
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'en', language: 'en-US', file: 'en.ts', name: 'English' },
      { code: 'es', language: 'es-ES', file: 'es.ts', name: 'Español' },
      { code: 'fr', language: 'fr-FR', file: 'fr.ts', name: 'Français' },
    ],
  },

  compatibilityDate: '2024-08-07',
})

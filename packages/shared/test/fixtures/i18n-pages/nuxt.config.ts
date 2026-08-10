export default defineNuxtConfig({
  modules: ['@nuxtjs/i18n'],
  i18n: {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    pages: {
      'catalog-id': { fr: '/produits/[id]' },
      'nested-about': { en: '/company' },
      'disabled': { fr: false },
      'unlocalized': false,
    },
  },
  compatibilityDate: '2025-01-01',
})

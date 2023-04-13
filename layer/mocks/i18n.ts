import { ref } from '#imports'

export const useI18n = () => {
  console.warn('[nuxt-seo-kit]: `useI18n` composable was not found, using a mock composable to continue functioning normally. make sure @nuxtjs/i18n module is loaded before nuxt-seo-kit.')
  return {
    t(key: string) { return key },
    localeProperties: ref({ code: 'en' }),
  }
}

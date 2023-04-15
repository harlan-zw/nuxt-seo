import { ref } from '#imports'

export const useI18n = () => {
  console.warn('[nuxt-seo-kit]: You must have the `@nuxtjs/i18n@` module installed to use i18n features.')
  return {
    t(key: string) { return key },
    localeProperties: ref({ code: 'en' }),
  }
}

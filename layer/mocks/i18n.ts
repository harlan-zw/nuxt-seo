import { ref } from '#imports'

export const useI18n = () => {
  return {
    t(key: string) { return key },
    localeProperties: ref({ code: 'en' }),
  }
}

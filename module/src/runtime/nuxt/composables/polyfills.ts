import { ref } from 'vue'
import { useSiteConfig } from '#imports'

export function useSchemaOrg() {}
export function defineWebSite() {}
export function defineWebPage() {}

export function useI18n() {
  const siteConfig = useSiteConfig()
  return {
    t: (_: string, fallback: string) => fallback,
    te: (_: string) => false,
    strategy: 'no_prefix',
    defaultLocale: ref(siteConfig.defaultLocale || 'en'),
    locale: ref(siteConfig.currentLocale || siteConfig.defaultLocale || 'en'),
  }
}

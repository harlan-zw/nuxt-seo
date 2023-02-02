export const SeoKitPublicRuntimeConfigKeys = [
  { key: 'siteName' },
  { key: 'siteDescription' },
  { key: 'siteImage' },
  { key: 'siteUrl', env: 'NUXT_PUBLIC_SITE_URL' },
  { key: 'titleSeparator' },
  { key: 'trailingSlash', env: 'NUXT_PUBLIC_TRAILING_SLASH' },
  { key: 'language' },
] as const

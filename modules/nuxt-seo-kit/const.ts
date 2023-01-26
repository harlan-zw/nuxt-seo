export const SeoKitPublicRuntimeConfigKeys = ['siteName', 'siteDescription', 'siteUrl', 'titleSeparator', 'trailingSlash', 'language'] as const

export type SeoKitPublicConfigKeys = typeof SeoKitPublicRuntimeConfigKeys[number]

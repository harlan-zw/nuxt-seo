import type { NuxtSeoModuleDetection } from './kit'
import { hasNuxtModule, useLogger, useNuxt } from '@nuxt/kit'
import { $fetch } from 'ofetch'
import { isTest } from 'std-env'
import { detectNuxtSeoModules } from './kit'

export function hookNuxtSeoProDataUpload(): void {
  const nuxt = useNuxt()
  const logger = useLogger('nuxt-seo-pro')
  const isBuild = !nuxt.options.dev && !nuxt.options._prepare
  // @ts-expect-error untyped
  if (isBuild && !nuxt._isNuxtSeoProUploading) {
    const license = nuxt.options.runtimeConfig.seoProKey || process.env.NUXT_SEO_PRO_KEY
    if (isTest || process.env.VITEST || !license) {
      return
    }
    // @ts-expect-error untyped
    nuxt._isNuxtSeoProUploading = true
    nuxt.hooks.hook('build:before', async () => {
      // Standalone modules can register shared hooks without installing Site Config.
      const siteConfigKit = hasNuxtModule('nuxt-site-config', nuxt) ? await import('nuxt-site-config/kit') : undefined
      const resolvedSiteConfig = siteConfigKit ? nuxt.runWithContext(() => siteConfigKit.useSiteConfig()) : undefined
      const siteUrl = resolvedSiteConfig?.url?.startsWith('http') ? resolvedSiteConfig.url : undefined
      const siteName = resolvedSiteConfig?.name || undefined
      const modules: NuxtSeoModuleDetection[] = detectNuxtSeoModules(nuxt)
      await nuxt.hooks.callHook('nuxt-seo-pro:modules' as any, modules)
      await $fetch<{ ok: boolean }>('https://nuxtseo.com/api/pro/verify', {
        method: 'POST',
        body: {
          apiKey: license,
          siteUrl,
          siteName,
          modules: modules.length > 0 ? modules : undefined,
        },
      }).catch((err) => {
        logger.debug('Pro data upload failed', err)
      })
    })
  }
}

import type { NuxtSeoModuleDetection } from './kit'
import { useLogger, useNuxt } from '@nuxt/kit'
import { useSiteConfig } from 'nuxt-site-config/kit'
import { $fetch } from 'ofetch'
import { isTest } from 'std-env'
import { detectNuxtSeoModules } from './kit'

export function hookNuxtSeoProDataUpload(): void {
  const nuxt = useNuxt()
  const logger = useLogger('nuxt-seo-pro')
  const isBuild = !nuxt.options.dev && !nuxt.options._prepare
  // @ts-expect-error untyped
  if (isBuild && !nuxt._isNuxtSeoProUploading) {
    // eslint-disable-next-line node/prefer-global/process
    const license = nuxt.options.runtimeConfig.seoProKey || process.env.NUXT_SEO_PRO_KEY
    // eslint-disable-next-line node/prefer-global/process
    if (isTest || process.env.VITEST || !license) {
      return
    }
    // @ts-expect-error untyped
    nuxt._isNuxtSeoProUploading = true
    nuxt.hooks.hook('build:before', async () => {
      const siteConfig = useSiteConfig()
      const siteUrl = siteConfig.url?.startsWith('http') ? siteConfig.url : undefined
      const siteName = siteConfig.name || undefined
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

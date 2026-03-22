import * as p from '@clack/prompts'
import { useLogger, useNuxt } from '@nuxt/kit'
import { useSiteConfig } from 'nuxt-site-config/kit'
import { $fetch } from 'ofetch'
import { isCI, isTest } from 'std-env'

const logger = useLogger('nuxt-seo-pro')

export interface ModuleRegistration {
  name: string
  version?: string
  secret?: string
  features?: Record<string, boolean | string | number>
}

/**
 * Register a Nuxt SEO Pro module for license verification.
 * Uses Nuxt hook so modules don't need to import from each other.
 *
 * Call this in your module setup. Registrations are collected
 * before the single license verification fetch.
 */
export function registerNuxtSeoProModule(registration: ModuleRegistration): void {
  const nuxt = useNuxt()
  // @ts-expect-error untyped
  nuxt._nuxtSeoProModules = nuxt._nuxtSeoProModules || []
  // @ts-expect-error untyped
  nuxt._nuxtSeoProModules.push(registration)
}

export function hookNuxtSeoProLicense(): void {
  const nuxt = useNuxt()
  const isBuild = !nuxt.options.dev && !nuxt.options._prepare
  // @ts-expect-error untyped
  if (isBuild && !nuxt._isNuxtSeoProVerifying) {
    // eslint-disable-next-line node/prefer-global/process
    const license = nuxt.options.runtimeConfig.seoProKey || process.env.NUXT_SEO_PRO_KEY
    // eslint-disable-next-line node/prefer-global/process
    if (isTest || process.env.VITEST) {
      return
    }
    if (!isCI && !license) {
      p.log.warn('⚠️  Building without license in non-CI environment. A license is required for production builds.')
      return
    }
    if (!license) {
      p.log.error('🔐 Nuxt SEO Pro license required')
      p.note('Set NUXT_SEO_PRO_KEY or configure via module options.\n\nhttps://nuxtseo.com/pro/dashboard', 'Get your license')
      throw new Error('Missing Nuxt SEO Pro license key.')
    }
    // @ts-expect-error untyped
    nuxt._isNuxtSeoProVerifying = true
    nuxt.hooks.hook('build:before', async () => {
      p.intro('Nuxt SEO Pro: License Verification')
      const siteConfig = useSiteConfig()
      const spinner = p.spinner()
      spinner.start('🔑 Verifying Nuxt SEO Pro license...')
      const siteUrl = siteConfig.url?.startsWith('http') ? siteConfig.url : undefined
      const siteName = siteConfig.name || undefined
      // @ts-expect-error untyped
      const modules: ModuleRegistration[] | undefined = nuxt._nuxtSeoProModules?.length > 0
        // @ts-expect-error untyped
        ? nuxt._nuxtSeoProModules
        : undefined
      const res = await $fetch<{ ok: boolean }>('https://nuxtseo.com/api/pro/verify', {
        method: 'POST',
        body: {
          apiKey: license,
          siteUrl,
          siteName,
          modules,
        },
      }).catch((err) => {
        if (err?.response?.status === 401) {
          spinner.error('Invalid API key')
          p.note('Your API key is invalid.\n\nhttps://nuxtseo.com/pro/dashboard', 'License Issue')
          throw new Error('Invalid Nuxt SEO Pro API key.')
        }
        if (err?.response?.status === 403) {
          spinner.error('No active subscription')
          p.note('Your subscription has expired or is inactive.\n\nhttps://nuxtseo.com/pro/dashboard', 'License Issue')
          throw new Error('No active Nuxt SEO Pro subscription.')
        }
        logger.error(err)
        return null
      })
      if (!res) {
        spinner.cancel('License verification skipped (network issue)')
        return
      }
      spinner.stop('License verified ✓')
    })
  }
}

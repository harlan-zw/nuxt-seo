import type { NuxtSEOModule } from '../src/const'
import { existsSync } from 'node:fs'
import { defineCollection } from '@nuxt/content'
import { relative, resolve } from 'pathe'
import z from 'zod'
import {
  LinkCheckerModule,
  OgImageModule,
  RobotsModule,
  SchemaOrgModule,
  SeoUtilsModule,
  SiteConfigModule,
  SitemapModule,
} from '../src/const'
import { logger } from './logger'

function getSubModuleCollection(m: NuxtSEOModule) {
  const localDirPaths = new Set([
    resolve(__dirname, '..', '..', m.npm, 'docs', 'content'),
    resolve(__dirname, '..', '..', m.repo.replace('harlan-zw/', '').replace('nuxt-modules/', ''), 'docs', 'content'),
  ])
  for (const localDirPath of localDirPaths) {
    if (existsSync(localDirPath)) {
      logger.info(`🔗 Docs source \`${m.slug}\` using local fs: ${relative(process.cwd(), localDirPath)}`)
      return defineCollection({
        type: 'page',
        source: {
          path: '**/*.md',
          cwd: localDirPath,
          prefix: `docs/${m.slug}`,
        },
      })
    }
  }
  // if (!foundSrc) {
  //   logger.info(`🔗 Docs source \`${m.slug}\` using GitHub: ${m.repo}`)
  // }
  // return [camelCase(m.slug), defineCollection({
  //   type: 'page',
  //   source: {
  //     path: '',
  //     prefix: `/docs/${key}.${m.slug}`,
  //     repository: `https://github.com/nuxt-modules/sitemap/tree/main/docs/content`,
  //   },
  //   // token: process.env.NUXT_GITHUB_TOKEN || '',
  //   // driver: 'github',
  //   // dir: 'docs/content',
  // })]
}

export const collections = {
  nuxtSeo: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('content/nuxtSeo'),
      prefix: 'docs/nuxt-seo',
    },
  }),
  robots: getSubModuleCollection(RobotsModule),
  sitemap: getSubModuleCollection(SitemapModule),
  ogImage: getSubModuleCollection(OgImageModule),
  schemaOrg: getSubModuleCollection(SchemaOrgModule),
  linkChecker: getSubModuleCollection(LinkCheckerModule),
  seoUtils: getSubModuleCollection(SeoUtilsModule),
  siteConfig: getSubModuleCollection(SiteConfigModule),
  learn: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('content/learn'),
      prefix: 'learn',
    },
    schema: z.object({
      icon: z.string().optional(),
    }),
  }),
}

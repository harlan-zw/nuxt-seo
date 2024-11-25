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
  // use github source
  logger.info(`🔗 Docs source \`${m.slug}\` using GitHub: ${m.repo}`)
  return defineCollection({
    type: 'page',
    source: {
      repository: `https://github.com/${m.repo}`,
      path: 'docs/content/**/*.md',
      prefix: `/docs/${m.slug}`,
    },
  })
}

export const collections = {
  nuxtSeo: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('content/nuxtSeo'),
      prefix: '/docs/nuxt-seo',
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
      prefix: '/learn',
    },
    schema: z.object({
      icon: z.string().optional(),
      publishedAt: z.string().optional(),
      updatedAt: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      readTime: z.string(),
      ogImageComponent: z.string().optional(),
    }),
  }),
  root: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('content/root'),
      prefix: '/',
    },
    schema: z.object({
      icon: z.string().optional(),
      publishedAt: z.string().optional(),
      updatedAt: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      readTime: z.string(),
      ogImageComponent: z.string().optional(),
    }),
  }),
  recipes: defineCollection({
    type: 'page',
    source: {
      path: '**/*.md',
      cwd: resolve('content/recipes'),
      prefix: '/recipes',
    },
    schema: z.object({
      icon: z.string().optional(),
      publishedAt: z.string().optional(),
      updatedAt: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      readTime: z.string(),
      ogImageComponent: z.string().optional(),
    }),
  }),
}

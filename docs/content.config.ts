import type { NuxtSEOModule } from '../src/const'
import { existsSync } from 'node:fs'
import { defineCollection, defineContentConfig } from '@nuxt/content'
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
import { asSeoCollection } from '../src/content'
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
          include: '**/*.md',
          cwd: localDirPath,
          prefix: `docs/${m.slug}`,
        },
      })
    }
  }
  // use github source
  logger.info(`🔗 Docs source \`${m.slug}\` using GitHub: ${m.repo}`)
  return defineCollection(asSeoCollection({
    type: 'page',
    source: {
      repository: `https://github.com/${m.repo}`,
      include: 'docs/content/**/*.md',
      prefix: `/docs/${m.slug}`,
    },
  }))
}

export default defineContentConfig({
  collections: {
    nuxtSeo: defineCollection(asSeoCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        cwd: resolve('content/nuxtSeo'),
        prefix: '/docs/nuxt-seo',
      },
    })),
    robots: getSubModuleCollection(RobotsModule),
    sitemap: getSubModuleCollection(SitemapModule),
    ogImage: getSubModuleCollection(OgImageModule),
    schemaOrg: getSubModuleCollection(SchemaOrgModule),
    linkChecker: getSubModuleCollection(LinkCheckerModule),
    seoUtils: getSubModuleCollection(SeoUtilsModule),
    siteConfig: getSubModuleCollection(SiteConfigModule),
    learn: defineCollection(asSeoCollection({
      type: 'page',
      source: {
        include: '**/*.md',
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
    })),
    root: defineCollection(asSeoCollection({
      type: 'page',
      source: {
        include: '**/*.md',
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
    })),
    recipes: defineCollection(asSeoCollection({
      type: 'page',
      source: {
        include: '**/*.md',
        cwd: resolve('content/recipes'),
        prefix: '/recipes',
      },
      schema: z.object({
        icon: z.string().optional(),
        publishedAt: z.string().optional(),
        updatedAt: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        readTime: z.string(),
      }),
    })),
  },
})

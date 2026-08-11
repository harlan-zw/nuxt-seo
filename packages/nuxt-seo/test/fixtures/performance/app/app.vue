<script setup lang="ts">
import { defineOgImage, defineWebPage, defineWebSite, useHead, useSchemaOrg, useSeoMeta } from '#imports'

const products = Array.from({ length: 50 }, (_, index) => ({
  name: `Product ${index}`,
  path: `/products/${index}`,
  description: `Search description for product ${index}.`,
}))

useSeoMeta({
  title: 'Nuxt SEO SSR Benchmark',
  description: 'A repeatable SSR workload for Nuxt SEO.',
  ogTitle: 'Nuxt SEO SSR Benchmark',
  ogDescription: 'A repeatable SSR workload for Nuxt SEO.',
  twitterCard: 'summary_large_image',
})

useHead({
  meta: products.map(product => ({
    key: `product:${product.path}`,
    name: 'product',
    content: product.description,
  })),
  link: products.map(product => ({
    key: `product:${product.path}`,
    rel: 'alternate' as const,
    hreflang: 'en-AU',
    href: product.path,
  })),
})

useSchemaOrg([
  defineWebSite({
    name: 'Nuxt SEO Benchmark',
  }),
  defineWebPage({
    name: 'Nuxt SEO SSR Benchmark',
    description: 'A repeatable SSR workload for Nuxt SEO.',
  }),
])

defineOgImage('NuxtSeoSatori')
</script>

<template>
  <main>
    <h1>Nuxt SEO SSR Benchmark</h1>
    <nav>
      <NuxtLink
        v-for="product in products"
        :key="product.path"
        :to="product.path"
      >
        {{ product.name }}
      </NuxtLink>
    </nav>
  </main>
</template>

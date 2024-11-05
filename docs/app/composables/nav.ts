import { modules } from '../../../src/const'

const ecosystemLinks = [
  {
    label: 'Unhead',
    to: 'https://unhead.unjs.io',
    icon: 'i-custom-unhead',
    target: '_blank',
    description: 'Unhead is the any-framework document head manager built for performance and delightful developer experience.',
  },
  {
    label: 'Zhead',
    to: 'https://zhead.dev',
    icon: 'i-custom-unhead',
    description: 'Zhead is an open-source <head> database. Discover new tags to use to improve your SEO, accessibility and performance.',
    target: '_blank',
  },
  {
    label: 'Request Indexing',
    icon: 'i-custom-request-indexing',
    to: 'https://requestindexing.com',
    description: 'A free, open-source tool to request pages to be indexed using the Web Search Indexing API and view your Google Search Console data.',
    target: '_blank',
  },
  {
    label: 'Unlighthouse',
    icon: 'i-custom-unlighthouse',
    to: 'https://unlighthouse.dev',
    description: 'Unlighthouse is a tool to scan your entire site with Google Lighthouse in 2 minutes (on average). Open source, fully configurable with minimal setup.',
    target: '_blank',
  },
]

export const menu = computed(() => {
  return [
    {
      label: 'Docs',
      icon: 'i-ph-book-open-duotone',
      children: modules.map(m => ({
        label: m.label,
        icon: m.icon,
        description: m.description,
        to: `/docs/${m.slug}/getting-started/introduction`,
      })),
    },
    {
      label: 'Learn',
      icon: 'i-ph-books-duotone',
      children: [
        {
          label: 'Mastering Meta Management',
          description: 'Learn title templates, dynamic meta tags, and social sharing in Vue. A complete guide to useHead() and meta patterns."',
          icon: 'i-heroicons-h1-solid',
          to: '/learn/mastering-meta',
        },
        {
          label: 'Controlling Web Crawlers',
          description: 'Being able to tell crawlers what to do can help with your SEO strategy, learn how to do it in Vue and Nuxt.',
          icon: 'i-ph-robot-duotone',
          to: '/learn/controlling-crawlers',
        },
        {
          label: 'Launch & Listen',
          description: 'Deploy your Vue app for SEO success. Complete guide to production URLs, indexing, monitoring, and performance tracking.',
          icon: 'i-tabler-slashes',
          to: '/learn/launch-and-listen',
        },
        {
          label: 'Routes & Rendering',
          description: 'Optimize Vue Router and content rendering for search engines. From dynamic routes to rendering strategies.',
          icon: 'i-carbon-recording',
          to: '/learn/routes-and-rendering',
        },
      ],
    },
    {
      label: 'Recipes',
      icon: 'i-ph-cooking-pot-duotone',
      children: [
        {
          label: 'Documentation Site',
          description: 'A starter kit for a documentation site with Nuxt SEO.',
          icon: 'i-carbon-document-requirements',
          to: '/learn/recipes/documentation-site',
        },
        // {
        //   label: 'Blog',
        //   description: 'A starter kit for a setting up a blog site with Nuxt SEO.',
        //   icon: 'i-tabler-slashes',
        //   to: '/learn/trailing-slashes',
        // },
      ],
    },
    {
      label: 'Releases',
      icon: 'i-carbon-version',
      to: '/releases',
    },
    {
      label: 'Pro',
      icon: 'i-ph-sparkle-duotone',
      to: '/pro',
      badge: {
        label: 'Presale',
        color: 'info',
      },
    },
    {
      label: 'Ecosystem',
      icon: 'i-ph-heart-straight-duotone',
      children: ecosystemLinks,
    },
  ]
})

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
          label: 'Mastering Page Titles',
          description: 'Learn best practices for titles, setting them with title templates and more.',
          icon: 'i-heroicons-h1-solid',
          to: '/learn/mastering-page-titles',
        },
        {
          label: 'Controlling Web Crawlers',
          description: 'Being able to tell crawlers what to do can help with your SEO strategy, learn how to do it in Vue and Nuxt.',
          icon: 'i-ph-robot-duotone',
          to: '/learn/controlling-crawlers',
        },
        {
          label: 'Trailing Slashes',
          description: 'Learn how to set up your Nuxt app to properly handle trailing slashes.',
          icon: 'i-tabler-slashes',
          to: '/learn/trailing-slashes',
        },
        {
          label: 'SEO Go-Live Checklist',
          description: 'Make sure you have everything in place when going live.',
          icon: 'i-carbon-recording',
          to: '/learn/going-live',
        },
        {
          label: 'Community Videos',
          to: '/learn/community-videos',
          description: 'Learn from the Nuxt community in using Nuxt SEO.',
          icon: 'i-ph-video-duotone',
        },
        {
          label: 'Danny Postma\'s SEO Blueprint',
          to: 'https://www.dannypostma.com/seo-course?via=harlan',
          description: 'The SEO blueprint to get your website to #1 brought to you by Nuxt Indiehacker Danny Postma.',
          icon: 'i-ph-rocket-duotone',
          target: '_blank',
        },
      ],
    },
    /* {
      label: 'Recipes',
      icon: 'i-ph-cooking-pot-duotone',
      children: [
        {
          label: 'Documentation Sites',
          description: 'Learn how to set up technical SEO for a documentation site in Vue or Nuxt.',
          icon: 'i-ph-notebook-duotone',
          to: '/learn/mastering-page-titles',
        },
        {
          label: 'SaaS Apps',
          description: 'Being able to tell crawlers what to do can help with your SEO strategy, learn how to do it in Vue and Nuxt.',
          icon: 'i-ph-rocket-launch-duotone',
          to: '/learn/controlling-crawlers',
        },
        {
          label: 'Blog',
          description: 'Learn how to set up your Nuxt app to properly handle trailing slashes.',
          icon: 'i-tabler-slashes',
          to: '/learn/trailing-slashes',
        },
      ],
    }, */
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

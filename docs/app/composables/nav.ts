import {modules} from "../../../src/const";

const ecosystemLinks = [
  {
    label: 'Unhead',
    to: 'https://unhead.unjs.io',
    target: '_blank',
    description: 'The universal head tag manager.',
  },
  {
    label: 'Zhead',
    to: 'https://zhead.dev',
    description: 'Find the best head tags for your site.',
    target: '_blank',
  },
  {
    label: 'Request Indexing',
    to: 'https://requestindexing.com',
    description: 'Get your site indexed.',
    target: '_blank',
  },
  {
    label: 'Unlighthouse',
    to: 'https://unlighthouse.dev',
    description: 'Scan your entire site using Lighthouse.',
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
        to: `/docs/${m.slug}/getting-started/installation`,
      })),
    },
    {
      label: 'Learn',
      icon: 'i-ph-books-duotone',
      badge: {
        label: 'New',
        color: 'success',
      },
      children: [
        {
          label: 'Community Videos',
          to: '/learn/community-videos',
          description: 'Community videos and tutorials.',
          icon: 'i-ph-video-duotone',
        },
        {
          label: 'Mastering Page Titles',
          description: 'Learn best practices for titles, setting them with title templates and more.',
          icon: 'i-heroicons-h1-solid',
          to: '/learn/mastering-titles-in-nuxt',
        },
        {
          label: 'Trailing Slashes in Nuxt',
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
      ],
    },
    {
      label: 'Releases',
      icon: 'i-ph-sparkle-duotone',
      to: '/releases',
    },
    {
      label: 'Pro',
      icon: 'i-ph-sparkle-duotone',
      to: '/pro',
      badge: {
        label: 'Waitlist',
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

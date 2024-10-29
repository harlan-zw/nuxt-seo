<script setup lang="ts">
import { useElementHover, useTransition, useWindowScroll } from '@vueuse/core'
import { ref } from 'vue'
import { reviews } from '~/composables/data'
import { humanNumber } from '~/composables/format'

definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Home',
  },
})

const modules = inject('modules')
const stats = inject('stats')

const { data: sponsors } = await useFetch('/api/github/sponsors')

// defineOgImageComponent('Home', {
//   title: 'Nuxt SEO',
//   version: useRuntimeConfig().public.version,
// })

interface JSConfettiApi {
  addConfetti: (options?: { emojis: string[] }) => void
}
declare global {
  interface Window {
    JSConfetti: { new (): JSConfettiApi }
  }
}

const confetti = useScript<JSConfettiApi>({
  key: 'confetti',
  src: 'https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js',
}, {
  use() {
    if (window.JSConfetti)
      return new window.JSConfetti()
  },
})

const scoreEl = ref()
const score = ref<number>(0)
const output = useTransition(score)
function clickScore() {
  score.value = 1
  setTimeout(() => {
    confetti.addConfetti({ emojis: ['🎉', '🎊', '🎈'] })
  }, 200)
}
// on scroll we'll increment the score
onMounted(() => {
  const scoreHovered = useElementHover(scoreEl.value)
  const endHoverWatch = watch(scoreHovered, (hovered) => {
    if (hovered) {
      confetti.$script.load()
      endHoverWatch()
    }
  })
  const { y: windowScrollY } = useWindowScroll()
  const endScrollWatch = watch(windowScrollY, (y) => {
    const { top, height } = scoreEl.value.getBoundingClientRect()
    const _score = Math.max(0, Math.min(1, 1 - ((top - height) / y)))
    if (score.value === 1) {
      endScrollWatch()
      return
    }
    if (_score !== score.value)
      score.value = _score
  })
})

const robotsItems = [
  {
    label: 'Zero config dynamic /robots.txt',
    slot: 'robots-txt',
    mdc: [
      '```robots-txt [robots.txt] meta=meta-value',
      `# START nuxt-robots (indexable)
User-agent: *

Sitemap: https://nuxtseo.com/sitemap.xml
# END nuxt-robots`,
      '```',
      'Learn about [how it works](/docs/robots/guides/how-it-works).',
    ].join('\n'),
  },
  {
    label: 'Page level robots control',
    slot: 'meta',
    mdc: [
      '```ts twoslash [/secret.vue]',
      '// modifies meta robots tag and X-Robots HTTP Header',
      'useRobotsRule(\'noindex, nofollow\')',
      '```',
      'See the [`useRobotsRule()`{lang="ts"}](/docs/robots/api/use-robots-rule) for full usage.',
    ].join('\n'),
  },
  {
    label: 'Avoid non-production sites getting indexed',
    slot: 'nonProduction',
    mdc: [
      '```dotenv [.env]',
      '# Disable indexing',
      'NUXT_PUBLIC_SITE_ENV=staging',
      '```',
      'See the [Disabling Site Indexing](/docs/robots/guides/disable-indexing) for further usage.',
    ].join('\n'),
  },
]

const sitemapItems = [
  {
    label: 'Zero config /sitemap.xml',
    slot: 'sitemap',
    mdc: [
      '```xml [sitemap.xml]',
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset>',
      ' <url>',
      '   <loc>https://nuxtseo.com/</loc>',
      ' </url>',
      '</urlset>',
      '```',
      'The above is a minimal example of what the module produces.',
      'Learn more about how [data sources](/docs/sitemap/guides/data-sources) work.',
    ].join('\n'),
  },
  {
    label: 'Simple multi sitemap support',
    slot: 'meta',
    mdc: [
      // nuxt.config sitemaps
      '```ts twoslash [nuxt.config.js]',
      'export default defineNuxtConfig({',
      '  sitemap: {',
      '    sitemaps: {',
      '      sitemapOne: { /* ... */ },',
      '      sitemapTwo: { /* ... */ },',
      '    }',
      '  }',
      '})',
      '```',
      'Learn more about [multi sitemaps](/docs/sitemap/guides/multi-sitemaps).',
    ].join('\n'),
  },
  {
    label: 'I18n and Nuxt Content Integration',
    slot: 'meta',
    mdc: [
      // markdown yaml example
      '```md',
      '---',
      'sitemap:',
      ' lastmod: 2021-09-01',
      '---',
      '```',
      'Learn more about the [I18n](/docs/sitemap/guides/i18n) and [Nuxt Content](/docs/sitemap/guides/content) integrations.',
    ].join('\n'),
  },
]

const schemaOrgItems = [
  {
    label: 'Zero config Schema.org',
    slot: 'schemaOrg',
    mdc: [
      '```json [schema-org.json]',
      `{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://nuxtseo.com/#website",
      "@type": "WebSite",
      "description": "Nuxt SEO is a collection of hand-crafted Nuxt Modules to help you rank higher in search engines.",
      "name": "Nuxt SEO",
      "url": "https://nuxtseo.com"
    },
    {
      "@id": "https://nuxtseo.com/#webpage",
      "@type": "WebPage",
      "description": "content",
      "url": "https://nuxtseo.com",
      "isPartOf": {
        "@id": "https://nuxtseo.com/#website"
      },
      "potentialAction": [
        {
          "@type": "ReadAction",
          "target": [
            "https://nuxtseo.com"
          ]
        }
      ]
    }
  ]
}`,
      '```',
      'Learn more about the [Default Schema.org](/docs/schema-org/guides/default-schema-org).',
    ].join('\n'),
  },
  {
    label: 'Easily set a linked Identity',
    slot: 'meta',
    mdc: [
      // nuxt.config sitemaps
      '```ts twoslash [nuxt.config.js]',
      `export default defineNuxtConfig({
  schemaOrg: {
    identity: {
      type: 'Person',
      name: 'Harlan Wilton',
      image: 'https://harlanzw.com/profile.jpg',
      sameAs: [
        'https://x.com/harlan_zw',
        'https://github.com/harlan-zw',
        'https://harlanzw.com'
      ]
    }
  }
})`,
      '```',
      'Learn more about [setting up your identity](/docs/schema-org/guides/quick-setup).',
    ].join('\n'),
  },
  {
    label: '20+ Rich Result nodes out-of-the-box',
    slot: 'meta2',
    mdc: [
      // markdown yaml example
      '```ts',
      // show faq example
      'useSchemaOrg([',
      '  defineWebPage({ \'@type\': \'FAQPage\' })',
      ` defineQuestion({
    name: 'How long is a piece of string?',
    acceptedAnswer: 'The length of a piece of string is the number of characters in the string.',
  }),`,
      '])',
      '```',
      'Learn more about the [I18n](/docs/sitemap/guides/i18n) and [Nuxt Content](/docs/sitemap/guides/content) integrations.',
    ].join('\n'),
  },
]

const seoUtilOneItems = [
  {
    label: 'Easy canonical URLs',
    slot: 'meta',
    mdc: [
      // nuxt.config sitemaps
      '```ts twoslash [nuxt.config.js]',
      `export default defineNuxtConfig({
  site: {
    url: 'https://nuxtseo.com'
  },
  seo: {
    // allow some query params to modify the canonical
    canonicalQueryWhitelist: ['search'],
    // redirect when the origin is different
    redirectToCanonicalSiteUrl: true
  }
})`,
      '```',
      'Learn more about [setting up your identity](/docs/schema-org/guides/quick-setup).',
    ].join('\n'),
  },
  {
    label: 'Default semantic Open Graph tags',
    slot: 'meta2',
    mdc: [
      // markdown yaml example
      '```html',
      '<meta property="og:url" content="https://nuxtseo.com/">',
      '<meta property="og:site_name" content="Nuxt SEO">',
      '<meta property="og:type" content="website">',
      '```',
      'Learn more about the [Best Practice Default Meta](/docs/seo-utils/guides/default-meta).',
    ].join('\n'),
  },
  {
    label: 'SEO Route Rules',
    slot: 'meta3',
    mdc: [
      '```ts [nuxt.config.ts]',
      `export default defineNuxtConfig({
  routeRules: {
    '/blog/**': {
      seoMeta: {
        ogImage: 'https://example.com'
      },
    },
  }
})`,
      '```',
      'Learn more about the [SEO Route Rules](/docs/seo-utils/guides/route-rules).',
    ].join('\n'),
  },
]

const ogImageItems = [
  {
    label: 'Dynamic Satori Powered OG Images',
    slot: 'meta',
    mdc: [
      // nuxt.config sitemaps
      '```ts twoslash',
      `defineOgImageComponent('MyTemplate')`,
      '```',
      'Learn more about the [Satori Renderer](/docs/og-image/guides/satori).',
    ].join('\n'),
  },
  {
    label: 'Page screenshots with one line',
    slot: 'meta2',
    mdc: [
      // nuxt.config sitemaps
      '```ts twoslash',
      `defineOgImageScreenshot()`,
      '```',
      'Learn more about the [Chromium Renderer](/docs/og-image/guides/satori).',
    ].join('\n'),
  },
  {
    label: '10+ Community Templates',
    slot: 'meta3',
    mdc: [
      // nuxt.config sitemaps
      `<img class="rounded-lg shadow-lg" width="300" height="150" style="aspect-ratio: 2 / 1;" src="/__og-image__/image/og.png?component=NuxtSeo&title=This+is+the+NuxtSeo+template" alt="NuxtSeo Template" />`,
      'Learn more about the [Community Templates](/docs/og-image/guides/community-templates).',
    ].join('\n'),
  },
]

const seoUtilsTwoItems = [
  {
    label: 'Default share Open Graph tags',
    slot: 'meta1',
    mdc: [
      // markdown yaml example
      '```ts',
      'useSeoMeta({',
      ' title: \'Nuxt SEO\',',
      ' description: \'All the boring SEO work for Nuxt done\'',
      '})',
      '```',
      '```html',
      `<title>Learn More</title>
<meta property="og:title" content="Nuxt SEO">
<meta name="description" content="All the boring SEO work for Nuxt done">
<meta property="og:description" content="All the boring SEO work for Nuxt done">`,
      '```',
      'Learn more about the [Best Practice Default Meta](/docs/seo-utils/guides/default-meta).',
    ].join('\n'),
  },
  {
    label: 'Zero config icon tags',
    slot: 'meta2',
    mdc: [
      // markdown yaml example
      '```dir',
      'public',
      '├── favicon.ico',
      '├── icon.png',
      '└── apple-touch-icon.png',
      '```',
      '```html',
      '<link rel="icon" href="/favicon.ico" sizes="any" />',
      '<link rel="icon" href="/icon.png" sizes="32x32" type="image/png" />',
      '<link rel="apple-touch-icon" href="/apple-icon.png" sizes="180x180" />',
      '```',
      'Learn more about using [App Icons](/docs/seo-utils/guides/app-icons).',
    ].join('\n'),
  },
  {
    label: 'Fallback Titles',
    slot: 'meta3',
    mdc: [
      // markdown yaml example
      '```dir',
      'pages',
      '└── blog',
      '    └── all-about-titles.vue',
      '```',
      '```html',
      '<title>All About Titles</title>',
      '<meta property="og:title" content="All About Titles">',
      '```',
      'Learn more about [Fallback titles](/docs/seo-utils/guides/fallback-title).',
    ].join('\n'),
  },
]

const linkCheckerItems = [
  {
    label: 'Realtime Feedback on Broken Links',
    slot: 'meta1',
    mdc: [
      `<video loading="lazy" src="https://user-images.githubusercontent.com/5326365/257094687-84516191-0e0f-4606-a1c5-36ed85c35734.webm" data-canonical-src="https://user-images.githubusercontent.com/5326365/257094687-84516191-0e0f-4606-a1c5-36ed85c35734.webm" controls="controls" muted="muted" class="d-block rounded-bottom-2 border-top width-fit" style="max-height:640px; min-height: 200px"></video>`,
      'Learn more about the [Live Inspections](/docs/link-checker/guides/live-inspections).',
    ].join('\n'),
  },
  {
    label: '7 Link Check Inspections',
    slot: 'meta1',
    mdc: [
      // markdown yaml example
      `
| Inspection | Description                                            |
| --- |--------------------------------------------------------|
| \`missing-hash\` | Checks for missing hashes in internal links.           |
| \`no-error-response\` | Checks for error responses (4xx, 5xx) on internal links. |
| \`no-baseless\` | Checks for baseless links.                             |
| \`no-javascript\` | Checks for javascript links.                           |
| \`trailing-slash\` | Checks for trailing slashes on internal links.         |
| \`absolute-site-urls\` | Checks for absolute site URLs.                         |
| \`redirects\` | Checks for redirects.                                  |
`,
      'Learn more about the [Inspections](/docs/link-checker/guides/skip-inspections).',
    ].join('\n'),
  },
  {
    label: 'Link Audit Reports',
    slot: 'meta3',
    mdc: [
      // markdown yaml example
      '```json [link-checker-report.json]',
      `[
  {
    "route": "/",
    "reports": [
      {
        "error": [],
        "warning": [
          {
            "name": "trailing-slash",
            "scope": "warning",
            "message": "Should not have a trailing slash.",
            "tip": "Incorrect trailing slashes can cause duplicate pages in search engines and waste crawl budget.",
            "fix": "/some-prefix",
            "fixDescription": "Removing trailing slash."
          }
        ],
        "fix": "/some-prefix",
        "link": "/some-prefix/",
        "passes": false,
        "textContent": "Nuxt nuxt-link-checker-playground"
      },
    ]
  }
]`,
      '```',
      'Learn more about the [Inspections](/docs/link-checker/guides/skip-inspections).',
    ].join('\n'),
  },
]

const [DefineSectionTemplate, ReuseSectionTemplate] = createReusableTemplate()

const graphData = computed(() => {
  // each modules contains a downloads array where each is an object with a date and downloads
  // we need to merge all of them based on the date and combine the downloads
  return stats.value.modules.reduce((acc, module) => {
    module.downloads.forEach(({ day, downloads }) => {
      const existing = acc.find(d => d.day === day)
      if (existing) {
        existing.downloads += downloads
      }
      else {
        acc.push({ day, downloads })
      }
    })
    return acc
  }, [])
})
</script>

<template>
  <div>
    <DefineSectionTemplate v-slot="{ section, $slots }">
      <section class="mb-8 xl:mb-14">
        <div class="xl:grid xl:max-w-full max-w-3xl mx-auto px-10 xl:px-0 grid-cols-6">
          <div class="col-span-1 xl:border-t pt-5 px-5 xl:p-0" :class="[section.bg, section.border]">
            <div class="sticky top-[80px] xl:py-10 flex xl:justify-end mr-5">
              <div class=" text-4xl font-mono flex  items-center gap-3">
                {{ section.id }}. <UIcon :name="section.icon" class="w-10 h-10" />
              </div>
            </div>
          </div>
          <div class="col-span-1 p-5 xl:p-0 relative xl:rounded-r-[70px] xl:pr-7 h-full xl:border-t xl:border-r xl:bottom-b xl:px-4 xl:py-10" :class="[section.bg, section.border]">
            <div class="relative flex items-center gap-3 sticky top-[100px]">
              <div>
                <h2 class="text-3xl text-balance text-gray-700 dark:text-gray-100 leading-tight font-bold mb-3 flex items-center gap-2">
                  {{ section.title }}
                </h2>
                <div class="text-balance dark:text-gray-300/80 text-gray-600">
                  {{ section.description }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3 py-10 2xl:px-14 xl:pl-5">
            <div class="xl:grid flex flex-col grid-cols-2 2xl:px-5 2xl:gap-10 gap-5">
              <div>
                <component :is="$slots.a" />
              </div>
              <div>
                <component :is="$slots.b" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </DefineSectionTemplate>

    <div class="gradient" />
    <section class="xl:max-w-full max-w-3xl mx-auto py-5 sm:py-12 xl:py-20">
      <UContainer>
        <div class="mb-5 sm:mb-0">
          <div class="sm:inline-flex block mb-5 gap-3 inline px-3 py-2 rounded text-sm ">
            <UButton size="sm" variant="outline" to="/announcement">
              <UIcon name="i-noto-party-popper" />
              <span>Announcing Nuxt SEO</span>
            </UButton>
          </div>
        </div>
        <div class="xl:flex gap-10">
          <div class="flex flex-col justify-center">
            <h1 class="max-w-xl text-gray-900/90 dark:text-gray-100 text-4xl md:text-6xl leading-tight font-bold tracking-tight" style="line-height: 1.3;">
              Your boring Nuxt <span class="font-cursive dark:text-yellow-200 text-purple-600">Technical SEO</span> shipped in <span class="bg-green-500/10 px-2"> 2 mins</span>.
            </h1>
            <p class="max-w-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-base md:text-xl">
              Nuxt SEO is a collection of  <NuxtLink to="https://nuxt.com/modules" class="font-semibold">
                modules
              </NuxtLink> that handle all of the technical aspects in growing your sites organic traffic.
            </p>

            <div class="flex mb-5 items-center gap-4 mt-5 md:mt-10  justify-start">
              <UButton size="lg" to="/docs/nuxt-seo/getting-started/introduction">
                Get Started
              </UButton>
              <UButton size="lg" icon="i-carbon-download" variant="ghost" to="/docs/nuxt-seo/getting-started/installation">
                Install Nuxt SEO
              </UButton>
            </div>
          </div>
          <div class="hidden xl:block max-w-2xl">
            <div class="relative h-full">
              <div class="z-10 text-blue-200 w-full h-full flex items-center justify-center group-hover:text-blue-500 transition-all relative">
                <Dock class="mb-6  left-[100px] top-10">
                  <DockIcon v-for="(module, key) in modules.filter(m => m.slug !== 'site-config' && m.slug !== 'nuxt-seo')" v-bind="module" :key="key" class="" :icon="module.icon" />
                </Dock>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
    <ReuseSectionTemplate
      :section="{
        id: 1,
        icon: 'i-noto-spider',
        title: 'Put web crawlers to work.',
        description: 'Providing a robots.txt and sitemap.xml gives web crawlers data on how to index your site.',
        bg: 'dark:bg-pink-500/5 bg-pink-500/15',
        border: 'border-pink-500/10 border-pink-500/50',
      }"
    >
      <template #a>
        <ModuleFeaturesCard module="robots" :items="robotsItems" />
      </template>
      <template #b>
        <ModuleFeaturesCard module="sitemap" :items="sitemapItems" />
      </template>
    </ReuseSectionTemplate>
    <ReuseSectionTemplate
      v-motion-fade-visible
      :section="{
        id: 2,
        icon: 'i-noto-robot',
        title: 'Feed semantic data to hungry bots.',
        description: 'Robots love data, give them what they want with Schema.org and Open Graph tags.',
        bg: 'dark:bg-purple-500/5 bg-purple-500/15',
        border: 'border-purple-500/10 border-purple-500/50',
      }"
    >
      <template #a>
        <ModuleFeaturesCard module="schema-org" :items="schemaOrgItems" />
      </template>
      <template #b>
        <ModuleFeaturesCard module="seo-utils" :items="seoUtilOneItems" />
      </template>
    </ReuseSectionTemplate>
    <ReuseSectionTemplate
      v-motion-fade-visible
      :section="{
        id: 3,
        icon: 'i-noto-sparkles',
        title: 'Humanize it.',
        description: 'Technical SEO doesn\'t just involve robots, make sure your site is human friendly too.',
        bg: 'dark:bg-yellow-500/5 bg-yellow-500/15',
        border: 'border-yellow-500/10 border-yellow-500/50',
      }"
    >
      <template #a>
        <ModuleFeaturesCard module="og-image" :items="ogImageItems" />
      </template>
      <template #b>
        <ModuleFeaturesCard module="seo-utils" :items="seoUtilsTwoItems" />
      </template>
    </ReuseSectionTemplate>
    <ReuseSectionTemplate
      v-motion-fade-visible
      :section="{
        id: 4,
        icon: 'i-noto-potted-plant',
        title: 'Nurture and watch it flourish.',
        description: 'Providing a robots.txt and sitemap.xml gives web crawlers data on how to index your site.',
        bg: 'dark:bg-green-500/5 bg-green-500/15',
        border: 'border-green-500/10 border-green-500/50',
      }"
    >
      <template #a>
        <div class="space-y-6">
          <ModuleFeaturesCard module="link-checker" :items="linkCheckerItems" />
          <ModuleCardInternalLinks />
          <ModuleCardSEOValidate />
        </div>
      </template>
      <template #b>
        <div class="mb-8">
          <ModuleCardMagicRedirects />
        </div>
        <ModuleCardGsc />
      </template>
    </ReuseSectionTemplate>
    <section v-motion-slide-visible-once-left class="pb-10 xl:pb-20">
      <UContainer class="mb-10">
        <h2 class="font-bold mb-5 text-3xl">
          Nuxt SEO Principals
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ShowcaseCard label="Delightful Developer Experience" description="Full featured modules that do everything you expect and more.">
            <UIcon name="i-noto-sparkles" class="w-1/2 h-1/2" />
          </ShowcaseCard>
          <ShowcaseCard label="Zero Config Defaults" description="Provide a site URL and all modules are good to go. Fully extensible with config and hooks.">
            <UIcon name="i-noto-rocket" class="w-1/2 h-1/2" />
          </ShowcaseCard>
          <ShowcaseCard label="Integrate with Ecosystem" description="Modules integrate with themselves as well as Nuxt Content, Nuxt I18n and Nuxt DevTools.">
            <div class="gap-5 flex">
              <div><img alt="Nuxt I18n Icon" class="h-20" height="80" width="80" src="https://ipx.nuxt.com/s_80,f_auto/gh/nuxt/modules/main/icons/i18n.png"></div>
              <div><img alt="Nuxt Icon" class="h-20" height="80" width="80" src="https://raw.githubusercontent.com/nuxt/modules/main/icons/nuxt.svg"></div>
            </div>
          </ShowcaseCard>
        </div>
      </UContainer>
      <UContainer>
        <h3 class="text-center font-bold mb-5 text-2xl font-semibold">
          For Apps All Shapes and Sizes
        </h3>
        <div class="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-lg">
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl  text-center p-3 flex items-center justify-center">
            Single Page
          </div>
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl text-center p-3 flex items-center justify-center">
            Server-Side Generated
          </div>
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl text-center p-3 flex items-center justify-center">
            Server-Side Rendered
          </div>
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl  text-center p-3 flex items-center justify-center">
            Multi-tenancy
          </div>
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl text-center p-3 flex items-center justify-center">
            Base URL
          </div>
          <div class="bg-neutral-700/20 ring ring-neutral-500/50 rounded-xl text-center p-3 flex items-center justify-center">
            Trailing Slashes
          </div>
        </div>
      </UContainer>
    </section>
    <section ref="scoreEl" v-motion-slide-visible-once-left class="pb-10 xl:pb-20 max-w-4xl mx-auto">
      <div class="md:flex items-center justify-around gap-10 py-5 px-3 lg:bg-gradient-to-br from-sky-500/20 dark:from-sky-900/20 rounded-full cursor-pointer lg:shadow-sm hover:shadow transition-shadow" @click="clickScore">
        <UIcon name="i-logos-lighthouse" class="!hidden lg:!block w-[175px] h-[175px]" />
        <div class="lg:flex-grow">
          <h2 class="text-3xl flex items-center gap-2 font-bold dark:opacity-90 leading-normal mb-3">
            <UIcon name="i-carbon-checkmark-filled" class="opacity-60 text-green-500" /> Technical SEO Audits
          </h2>
          <p class="max-w-[30rem] text-lg">
            Nuxt SEO provides you with with all the tools needed to help you pass technical SEO audits on Google Lighthouse.
          </p>
        </div>
        <div class="lg:w-1/3 flex items-center justify-center">
          <MetricGuage :score="output" label="SEO" class="text-2xl" />
        </div>
      </div>
    </section>
    <section class="pb-10 xl:pb-20">
      <UContainer>
        <div class="lg:flex gap-10 items-center justify-between">
          <div class="mb-10">
            <div class="mb-10 mx-auto max-w-[35rem] flex flex-col justify-center">
              <h2 class="font-bold mb-5 text-5xl">
                Up To Date. Always.
                <span class="text-blue-300 text-3xl" />
              </h2>
              <p class="text-gray-700 mb-3 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
                Nuxt SEO was started at the end of 2022 and has received continuous bug fixes and feature improvements from the community.
              </p>
              <div class="gap-2 mx-auto text-center grid grid-cols-12">
                <UAvatar v-for="(c, index) in stats.uniqueContributors || []" :key="index" :alt="`GitHub User ${c}`" loading="lazy" :src="`https://avatars.githubusercontent.com/u/${c}?s=80&v=4`" />
              </div>
            </div>
          </div>
          <div class=" text-center justify-center gap-16 lg:mx-20 xl:mx-0 mb-10 ">
            <div class="mb-7">
              <div class="flex justify-center gap-10">
                <div>
                  <div class="font-light flex items-center gap-3 text-6xl mb-2">
                    <UIcon name="i-carbon-commit" />
                    {{ humanNumber(stats.totalCommits) }}
                  </div>
                  <div class="text-sm opacity-80">
                    Commits
                  </div>
                </div>
                <div>
                  <div class="font-light flex items-center gap-3 text-6xl mb-2">
                    <UIcon name="i-carbon-checkmark" />
                    {{ humanNumber(stats.totalIssuesClosed) }}
                  </div>
                  <div class="text-sm opacity-80">
                    Issues Closed
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div>
                <div class="font-light text-6xl mb-2">
                  <UIcon name="i-carbon-user-favorite-alt" />
                  {{ stats.uniqueContributors.length || 0 }}
                </div>
                <div class="text-sm opacity-80">
                  Contributors
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <section class="pb-10 xl:pb-20">
      <div class="mb-10">
        <div class="text-center mb-10 mx-auto max-w-[35rem] flex flex-col justify-center">
          <h2 class="font-bold mb-5 text-5xl">
            Loved by Nuxt Developers
            <span class="text-blue-300 text-3xl" />
          </h2>
          <p class="text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
            Nuxt SEO was built for the community. Here's what some of them have to say.
          </p>
        </div>
        <UContainer>
          <div
            class="relative flex h-[500px] w-full space-y-5 flex-col items-center justify-center overflow-hidden rounded-lg bg-background mb-12"
          >
            <Marquee pause-on-hover class="[--duration:20s]">
              <ReviewCard
                v-for="review in reviews.slice(0, Math.round((reviews.length / 2)))"
                :key="review.username"
                :img="review.img"
                :name="review.name"
                :username="review.username"
                :body="review.body"
              />
            </Marquee>

            <Marquee reverse pause-on-hover class="[--duration:20s]">
              <ReviewCard
                v-for="review in reviews.slice(Math.round((reviews.length / 2)) - 1)"
                :key="review.username"
                :img="review.img"
                :name="review.name"
                :username="review.username"
                :body="review.body"
              />
            </Marquee>

            <div
              class="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-gray-900"
            />

            <div
              class="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-gray-900"
            />
          </div>
        </UContainer>
      </div>
      <UContainer>
        <div class="xl:flex items-center justify-around my-14">
          <div class="xl:max-w-sm xl:mb-0 mb-10">
            <div class="font-bold mb-5 text-5xl">
              {{ humanNumber(stats.modules.reduce((sum, m) => sum + m.averageDownloads30, 0)) }} downloads<br>
              <span class="text-blue-300 text-3xl">per day, on average</span>
            </div>
            <p class="opacity-80 mb-5">
              Nuxt SEO is used and trusted by thousands of developers and companies around the world.
            </p>
          </div>
          <div class="text-6xl space-y-6 px-5 lg:px-0">
            <div class="flex justify-between text-right gap-5">
              <div class="mb-1  font-light items-center flex gap-5">
                <UIcon name="i-carbon-chart-line-smooth" class="h-15 w-15 mr-1 opacity-80" />
                {{ humanNumber(stats.modules.reduce((sum, m) => sum + m.totalDownloads30, 0)) }}
              </div>
              <div class="flex items-center font-normal opacity-70 text-sm">
                Downloads<br>/ month
              </div>
            </div>
            <div class="flex justify-between gap-5">
              <div class="mb-1 font-light items-center flex gap-5">
                <UIcon name="i-carbon-star" class="h-15 w-15 mr-1 opacity-90" />
                {{ humanNumber(stats.modules.reduce((sum, m) => sum + m.stars, 0)) }}
              </div>
              <div class="flex items-center font-normal text-right opacity-70 text-sm">
                Total Stars
              </div>
            </div>
          </div>
        </div>
        <UCard class="max-w-full overflow-hidden sm:max-w-[600px] mx-auto p-5">
          <ClientOnly>
            <LazyChartDownloads :value="graphData" />
          </ClientOnly>
        </UCard>
      </UContainer>
    </section>
    <section class="mb-14">
      <UContainer>
        <div class="xl:grid grid-cols-2 gap-10">
          <div class="mb-10 mx-auto max-w-lg flex flex-col  lg:items-start">
            <h2 class=" font-bold mb-3 text-5xl text-center lg:text-left">
              Funded by the community
              <span class="text-blue-300 text-3xl" />
            </h2>
            <p class="mb-5 text-gray-700 dark:text-gray-300 mt-4 max-w-xl text-center text-xl lg:text-left">
              Nuxt SEO is completely free and open-source due to the generous support of the community.
            </p>
            <div>
              <UButton size="lg" to="https://github.com/sponsors/harlan-zw">
                Become a sponsor
              </UButton>
            </div>
          </div>
          <div class="max-w-xl mx-auto">
            <div class="text-2xl font-semibold mb-5">
              Top Sponsors
            </div>
            <div class="sm:grid space-y-5 md:space-y-0 grid-cols-3 gap-5 mb-10">
              <div v-for="(entry, key) in sponsors.$50" :key="key">
                <NuxtLink :to="entry.sponsor.websiteUrl" class="flex items-center gap-2">
                  <NuxtImg loading="lazy" :alt="entry.sponsor.name" width="56" height="56" :src="entry.sponsor.avatarUrl" class="w-14 h-14 rounded-full" />
                  <div>
                    <div class="font-bold text-xl whitespace-nowrap">
                      {{ entry.sponsor.name }}
                    </div>
                    <div v-if="entry.sponsor.websiteUrl" class="text-gray-400">
                      {{ entry.sponsor.websiteUrl.replace('https://', '') }}
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
            <div class="text-2xl font-semibold mb-5">
              Gold Sponsors
            </div>
            <div class="sm:grid space-y-5 md:space-y-0 grid-cols-3 gap-5 mb-10">
              <div v-for="(entry, key) in sponsors.$25" :key="key">
                <NuxtLink :to="entry.sponsor.websiteUrl" class="flex items-center gap-2">
                  <NuxtImg loading="lazy" :alt="entry.sponsor.name || entry.sponsor.login" width="48" height="48" :src="entry.sponsor.avatarUrl" class="w-12 h-12 rounded-full" />
                  <div>
                    <div class="font-bold text-sm whitespace-nowrap">
                      {{ entry.sponsor.name || entry.sponsor.login }}
                    </div>
                    <div v-if="entry.sponsor.websiteUrl" class="text-xs text-gray-400">
                      {{ entry.sponsor.websiteUrl.replace('https://', '') }}
                    </div>
                  </div>
                </NuxtLink>
              </div>
            </div>
            <div class="text-2xl font-semibold mb-5">
              Backers
            </div>
            <div class="grid grid-cols-6 sm:grid-cols-10 gap-3 mb-10">
              <div v-for="(entry, key) in sponsors.others" :key="key">
                <UTooltip :text="entry.sponsor.name || entry.sponsor.login">
                  <NuxtLink :to="(entry.monthlyDollars > 5 ? entry.sponsor.websiteUrl : entry.sponsor.linkUrl) || entry.sponsor.linkUrl" class="flex items-center gap-2">
                    <NuxtImg loading="lazy" :alt="entry.sponsor.name || entry.sponsor.login" width="48" height="48" :src="entry.sponsor.avatarUrl" class="w-12 h-12 rounded-full" :class="entry.monthlyDollars > 5 ? ['ring-green-500 ring-2'] : []" />
                  </NuxtLink>
                </UTooltip>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>
  </div>
</template>

<style lang="postcss">
.gradient {
  position: fixed;
  top: 25vh;
  width: 100%;
  height: 30vh;
  background: radial-gradient(50% 50% at 50% 50%, #00DC82 0%, rgba(0, 220, 130, 0) 100%);
  filter: blur(180px);
  opacity: 0.6;
  z-index: -1;
}
</style>

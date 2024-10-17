<script setup lang="ts">
import { useElementHover, useTransition, useWindowScroll } from '@vueuse/core'
import { ref } from 'vue'

definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Home',
  },
})

const { data: robotsTxt } = await useAsyncData('robotsTxt', () => $fetch('/api/robots-txt'))
const { data: sitemapXml } = await useAsyncData('sitemapXml', () => $fetch('/api/sitemap-xml'))

const modules = inject('modules')
const stats = inject('stats')
const listedModules = modules.filter(m => !['nuxt-seo', 'site-config'].includes(m.slug))

const robotState = ref({
  hover: false,
  robots: [''], // start with 1
  collisions: 0,
})
// empty array of 10 entries
provide('robots', robotState)

const appendRobot = useDebounceFn(() => {
  if (robotState.value.robots.length >= 10)
    return

  robotState.value.robots.push('')
}, 100)

watch(() => robotState.value.collisions, appendRobot, {
  deep: true,
})

watch(() => robotState.value.hover, () => {
  if (!robotState.value.hover)
    robotState.value.robots = ['']
}, {
  deep: true,
})

// avoid dropping frames
const interval = computed(() => 1000 / 60)

defineOgImageComponent('Home', {
  title: 'Nuxt SEO',
  version: useRuntimeConfig().public.version,
})

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
function makeDateXAgo(date: Date) {
  // turn a date into a human readible string say x days ago, should also account for hours
  // we can and should use intl helper if it helps
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (days > 0)
    return `${days} days ago`
  if (hours > 0)
    return `${hours} hours ago`
  return 'just now'
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
const publicRuntimeConfig = useRuntimeConfig().public
const moduleStats = (publicRuntimeConfig.moduleStats || []) as { stats: { downloads: number, stars: number } }[]
const newestModules = Object.values(moduleStats).map((ms) => {
  const module = listedModules.find(r => r.id === ms.id)
  return {
    module,
    stats: {
      ...ms.stats,
      publishedAt: new Date(ms.stats.publishedAt),
    },
  }
}).filter(m => m.module && m.stats?.publishedAt).sort((a, b) => {
  return b.stats.publishedAt.getTime() - a.stats.publishedAt.getTime()
})

let totalDownloads = 0
let totalStars = 0
moduleStats
  .forEach(({ stats }) => {
    totalDownloads += Number(stats.downloads || 0)
    totalStars += Number(stats.stars || 0)
  })
const totalDownloadsHuman = Number(totalDownloads).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
const totalStarsHuman = Number(totalStars).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })

const robotsTxtMarkdown = [
  'Control the robots crawling your site.',
  '```robots-txt [robots.txt] meta=meta-value',
  robotsTxt.value,
  '```',
  'Configure via robots.txt OR use the composable.',
  '```ts twoslash [/secret.vue]',
  'useRobotsRule(\'noindex, nofollow\')',
  '```',
].join('\n')

const sitemapXmlMarkdown = [
  '```xml [sitemap.xml]',
  sitemapXml.value,
  '```',
].join('\n')

const schemaOrgMarkdown = [
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
].join('\n')

const enhanceMarkdown = [
  '```ts',
  'export default defineNuxtConfig({',
  `  site: {
    name: 'Nuxt SEO',
    description: 'All the boring SEO work for Nuxt done',
    url: 'https://nuxtseo.com/'
  }`,
  '})',
  '```',
  '```html',
  `<meta property="og:title" content="Nuxt SEO · All the boring SEO work for Nuxt done.">
<meta name="description" content="content">
<meta property="og:description" content="content">
<link rel="canonical" href="https://nuxtseo.com/">
<meta property="og:url" content="https://nuxtseo.com/">
<meta property="og:site_name" content="Nuxt SEO">`,
  '```',
].join('\n')

const useSeoMetaMarkdown = [
  '```ts',
  'useSeoMeta({',
  ` title: 'Learn More',
    description: 'All the boring SEO work for Nuxt done'
  })`,
  '```',
  '```html',
  `<title>Title</title>
<meta property="og:title" content="Nuxt SEO · All the boring SEO work for Nuxt done.">
<meta name="description" content="content">
<meta property="og:description" content="content">`,
  '```',
].join('\n')
</script>

<template>
  <div>
    <div class="gradient" />
    <section class=" py-5 sm:py-12 xl:py-20">
      <UContainer>
        <div class="flex justify-around">
          <div class="flex flex-col justify-center">
            <h1 class="max-w-xl text-gray-900/90 dark:text-gray-100 text-6xl leading-tight font-bold tracking-tight" style="line-height: 1.3;">
              Your boring Nuxt <span class="font-cursive dark:text-yellow-200 text-purple-600">Technical SEO</span> shipped in <span class="bg-green-500/10 px-2">minutes</span>.
            </h1>

            <p class="max-w-xl text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
              Nuxt SEO is a collection of  <NuxtLink to="https://nuxt.com/modules" class="font-semibold">
                modules
              </NuxtLink> that handle the technical aspects of growing your site's organic traffic.
            </p>

            <div class="flex mb-5 flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-6 lg:justify-start">
              <UButton size="lg" to="/docs/nuxt-seo/getting-started/what-is-nuxt-seo">
                What is Nuxt SEO?
              </UButton>
              <UButton size="lg" variant="ghost" to="/docs/nuxt-seo/getting-started/installation">
                <UIcon name="i-carbon-download" class="" />
                Install Nuxt SEO
              </UButton>
            </div>
          </div>
          <div class="max-w-2xl">
            <div class="relative h-full">
              <div class="h-full">
                <div class="group relative border-transparent dark:border-gray-500/30 hover:border-blue-400 transition h-full">
                  <div
                    class="relative flex items-center justify-center bg-no-repeat bg-cover border-b-2 border-gray-100/30 dark:border-gray-900/10"
                    style="background-image: url('/grid.png')"
                  >
                    <div
                      class="blur-overlay w-full h-full absolute pointer-events-none"
                    />
                    <div class="z-10 text-blue-200 w-full h-full flex items-center justify-center group-hover:text-blue-500 transition-all relative">
                      <div class="sticky top-10">
                        <Dock class="mb-6 absolute -left-[150px] top-10">
                          <DockIcon v-for="(module, key) in listedModules" v-bind="module" :key="key" class="" :icon="module.icon">
                            <p class="font-semibold group-hover:underline">
                              {{ module.label }}
                            </p>
                          <!--                            <NuxtLink -->
                          <!--                              class="group" -->
                          <!--                              :to="`/docs/${module.slug}/getting-started/installation`" -->
                          <!--                              :title="module.label" -->
                          <!--                            > -->
                          <!--                              <p class="font-semibold group-hover:underline"> -->
                          <!--                                {{ module.label }} -->
                          <!--                              </p> -->
                          <!--                            </NuxtLink> -->
                          </DockIcon>
                        </Dock>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          <!--            <div class="sticky top-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-[50px]"> -->
          <!--              <ShowcaseCardLink v-for="(module, key) in listedModules" v-bind="module" :key="key" class="group"> -->
          <!--                <template v-if="module.icon"> -->
          <!--                  <UIcon dynamic :name="module.icon" size="100" :class="[module.label === 'Robots' ? 'transition group-hover:opacity-0' : '']" class="text-blue-300" /> -->
          <!--                </template> -->
          <!--                <template #teleport> -->
          <!--                  <template v-if="module.label === 'Robots'"> -->
          <!--                    <BouncingBots v-for="(_, k) in robotState.robots" :key="k" icon="noto:robot" :interval="interval" /> -->
          <!--                  </template> -->
          <!--                </template> -->
          <!--              </ShowcaseCardLink> -->
          <!--            </div> -->
          </div>
        </div>
      </UContainer>
    </section>
    <section class="py-14 my-10 xl:pb-20 bg-blue-300 dark:bg-blue-950/50">
      <UContainer>
        <div class="mb-5 relative">
          <UBadge class="-left-[75px] top-1 text-3xl font-mono absolute">
            1.
          </UBadge>
          <h2 class="text-4xl text-gray-300 font-bold mb-3 max-w-lg">
            Tell the search engine bots what's up.
          </h2>
          <div class="text-gray-300/80">
            Providing a robots.txt and sitemap.xml gives web crawlers data on how to index your site.
          </div>
        </div>
        <UTabs :content="{ forceMount: false }" :items="[{ slot: 'robots', label: 'Robots' }, { slot: 'sitemap', label: 'Sitemap' }]">
          <template #robots>
            <div>
              <ModuleLabel slug="robots" size="lg" />
              <MDC :value="robotsTxtMarkdown" />
            </div>
          </template>
          <template #sitemap>
            <ModuleLabel slug="sitemap" size="lg" />
            <div class="mb-3">
              Tell crawlers where to find your content.
            </div>
            <UCard>
              <iframe loading="lazy" src="https://nuxtseo.com/sitemap.xml" class="w-full bg-black h-[400px] rounded overflow-hidden" />
            </UCard>
          </template>
        </UTabs>
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
      <UContainer v-motion-slide-visible-once-left>
        <div class="mb-5 relative">
          <UBadge class="-left-[75px] top-1 text-3xl font-mono absolute">
            2.
          </UBadge>
          <h2 class="text-4xl text-gray-300 font-bold mb-3 max-w-lg">
            Oh oh, looks like the bots are hungry. You better feed them.
          </h2>
          <div class="text-gray-300/80">
            Providing a robots.txt and sitemap.xml gives web crawlers data on how to index your site.
          </div>
          <div class="grid grid-cols-2 gap-10 mt-10">
            <div>
              <ModuleLabel slug="seo-utils" />
              <div>
                Best practice defaults.
              </div>
              <MDC :value="enhanceMarkdown" />
            </div>
            <div>
              <ModuleLabel slug="schema-org" />
              <div>
                Rich results from Google
              </div>
              <MDC :value="schemaOrgMarkdown" />
            </div>
          </div>
        </div>
      </UContainer>
    </section>
    <section v-motion-slide-visible-once-left class="pb-10 xl:pb-20">
      <UContainer v-motion-slide-visible-once-left>
        <div class="mb-5 relative">
          <UBadge class="-left-[75px] top-1 text-3xl font-mono absolute">
            3.
          </UBadge>
          <h2 class="text-4xl text-gray-300 font-bold mb-3 max-w-lg">
            Share it with the world
          </h2>
          <div class="text-gray-300/80">
            Providing a robots.txt and sitemap.xml gives web crawlers data on how to index your site.
          </div>
        </div>
        <div class="grid grid-cols-2 gap-10 mt-10">
          <div>
            <ModuleLabel slug="og-image" />
            <div class="flex items-center">
              <UButton variant="ghost" size="sm" icon="logos:twitter" />
              <UButton variant="ghost" size="sm" icon="logos:facebook" />
              <UButton variant="ghost" size="sm" icon="logos:slack-icon" />
              <UButton variant="ghost" size="sm" icon="logos:whatsapp-icon" />
            </div>
            <TwitterCardRenderer title="Nuxt SEO">
              <img src="https://nuxtseo.com/__og-image__/image/og.png">
              <template #domain>
                <a target="_blank" href="https://nuxtseo.com">From nuxtseo.com</a>
              </template>
            </TwitterCardRenderer>
          </div>
          <div>
            <ModuleLabel slug="seo-utils" />
            <MDC :value="useSeoMetaMarkdown" />
          </div>
        </div>
      </UContainer>
    </section>
    <section v-motion-slide-visible-once-left class="pb-10 xl:pb-20">
      <h2 class="text-3xl font-bold mb-5">
        4. Maintain and grow
      </h2>
      <div class="grid grid-cols-2 gap-10">
        <div>
          <ModuleLabel slug="link-checker" />
          <div>
            some ui
          </div>
        </div>
        <div>
          <div>coming soon?</div>
        </div>
      </div>
    </section>
    <section v-motion-slide-visible-once-left class="pb-10 xl:pb-20">
      <h2 class="font-bold mb-5 text-3xl">
        Principals
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ShowcaseCard label="Delightful Developer Experience" description="Full featured modules that do everything you expect and more.">
          <UIcon name="i-noto-sparkles" class="w-1/2 h-1/2" />
        </ShowcaseCard>
        <ShowcaseCard label="Minimal Config, Maximum Extensibility" description="Provide a site URL and all modules are good to go. Fully extensible with config and hooks.">
          <UIcon name="i-noto-rocket" class="w-1/2 h-1/2" />
        </ShowcaseCard>
        <ShowcaseCard label="Integration over boilerplate" description="Modules integrate with themselves as well as Nuxt Content and Nuxt I18n where appropriate.">
          <div class="gap-5 flex">
            <div><img alt="Nuxt I18n Icon" class="h-20" height="80" width="80" src="https://ipx.nuxt.com/s_80,f_auto/gh/nuxt/modules/main/icons/i18n.png"></div>
            <div><img alt="Nuxt Icon" class="h-20" height="80" width="80" src="https://raw.githubusercontent.com/nuxt/modules/main/icons/nuxt.svg"></div>
          </div>
        </ShowcaseCard>
      </div>
    </section>
    <section class="pb-10 xl:pb-20">
      <div class="lg:flex gap-10 items-center justify-between">
        <div class="mb-10">
          <div class="mb-10 mx-auto max-w-[35rem] flex flex-col justify-center">
            <h2 class="font-bold mb-5 text-5xl">
              Up To Date. Always.
              <span class="text-blue-300 text-3xl" />
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
              Nuxt SEO was started at the end of 2022 and has received continuous bug fixes and feature improvements from the community.
            </p>
          </div>
          <div v-if="newestModules.length" class="flex items-center justify-center">
            <div>
              <ul class="rounded-xl text-sm max-w-xs px-5 py-3 dark:bg-purple-900/20 bg-purple-50 border-2 border-solid border-purple-500/50 space-y-3">
                <li v-for="(module, key) in newestModules" :key="key" class="text-sm gap-2 justify-between w-full flex">
                  <div>
                    <NuxtLink :to="module.module?.tag!.to" class="underline">
                      {{ module.module?.label }}
                    </NuxtLink>
                    <span class="text-xs ml-2">{{ module.stats?.version }}</span>
                  </div>
                  <span class="opacity-80">{{ makeDateXAgo(module.stats?.publishedAt) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div class=" text-center justify-center gap-16 lg:mx-20 xl:mx-0 mb-10 ">
          <div class="mb-7">
            <div class="flex justify-center gap-10">
              <div>
                <div class="font-light text-6xl mb-2">
                  <UIcon name="i-carbon-commit" />
                  {{ stats.totalCommits }}
                </div>
                <div class="text-sm opacity-80">
                  Commits
                </div>
              </div>
              <div>
                <div class="font-light text-6xl mb-2">
                  <UIcon name="i-carbon-checkmark" />
                  {{ stats.totalIssuesClosed }}
                </div>
                <div class="text-sm opacity-80">
                  Issues Closed
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="mb-7 max-w-[330px] gap-2 mx-auto text-center grid grid-cols-7">
              <UAvatar v-for="(c, index) in stats.uniqueContributors || []" :key="index" :alt="`GitHub User ${c}`" height="32" width="32" loading="lazy" :src="`https://avatars.githubusercontent.com/u/${c}?s=80&v=4`" />
            </div>
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
        <div class="lg:grid grid-cols-3 gap-7">
          <div class="space-y-5">
            <Tweet id="1736006277501767688" />
            <Discord username="Barbapapazes" image="https://cdn.discordapp.com/avatars/314778949487951872/8c3d176848e89dfa3e9cd453b9a689e1.webp?size=64">
              <p>I have to say that your SEO modules are one of the things that make me stay on Nuxt for every one of my websites.</p>
            </Discord>
            <Tweet id="1723082721210036411" />
            <Discord username="marcustoy" image="https://cdn.discordapp.com/avatars/716064643809804288/4895f3e4b7551e9ee03a98f7cd2675fb.webp?size=80">
              <p>Hey man, appreciate all your great work on those Nuxt modules. I'm using Nuxt SEO and it's awesome! 💪🏻</p>
            </Discord>
          </div>
          <div class="hidden lg:block space-y-5">
            <Tweet id="1741040465770844213" />
            <Tweet id="1738686701634023696" />
          </div>
          <div class="hidden lg:block space-y-5">
            <Tweet id="1736008855736213732" />
            <Tweet id="1738672086644654346" />
          </div>
        </div>
      </div>
      <div class="xl:flex items-center justify-around mt-12">
        <div class="xl:max-w-sm xl:mb-0 mb-10">
          <div class="font-bold mb-5 text-5xl">
            {{ Number(totalDownloads / 30).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' }) }} downloads<br>
            <span class="text-blue-300 text-3xl">per day, on average</span>
          </div>
          <p class="opacity-80">
            Nuxt SEO is used and trusted by thousands of developers and companies around the world.
          </p>
        </div>
        <div class="text-6xl space-y-6 px-5 lg:px-0">
          <div class="flex justify-between text-right gap-5">
            <div class="mb-1  font-light items-center flex gap-5">
              <UIcon name="i-carbon-chart-line-smooth" class="h-15 w-15 mr-1 opacity-80" />
              <div>{{ totalDownloadsHuman }}</div>
            </div>
            <div class="flex items-center font-normal opacity-70 text-sm">
              Downloads<br>/ month
            </div>
          </div>
          <div class="flex justify-between gap-5">
            <div class="mb-1 font-light items-center flex gap-5">
              <UIcon name="i-carbon-star" class="h-15 w-15 mr-1 opacity-90" />
              {{ totalStarsHuman }}
            </div>
            <div class="flex items-center font-normal text-right opacity-70 text-sm">
              Total Stars
            </div>
          </div>
        </div>
      </div>
    </section>
    <section>
      <div class="xl:flex gap-10">
        <div class="mb-10 mx-auto max-w-[35rem] flex flex-col justify-center items-center lg:items-start">
          <h2 class="font-bold mb-5 text-5xl text-center lg:text-left">
            Funded by the community
            <span class="text-blue-300 text-3xl" />
          </h2>
          <p class="mb-5 text-gray-700 dark:text-gray-300 mt-4 max-w-3xl text-center text-xl lg:text-left">
            Nuxt SEO is completely free and open-source due to the generous support of the community.
          </p>
          <div>
            <UButton size="lg" to="https://github.com/sponsors/harlan-zw">
              Become a sponsor
            </UButton>
          </div>
        </div>

        <a href="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg">
          <img alt="Nuxt SEO Sponsors" loading="lazy" src="https://raw.githubusercontent.com/harlan-zw/static/main/sponsors.svg" width="800" height="545" style="margin: 0 auto;">
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss">
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

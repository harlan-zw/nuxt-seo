<script setup lang="ts">
import { formatTimeAgo } from '@vueuse/core'
import { useStats } from '~/composables/data'

definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Home',
  },
})

const stats = await useStats()

// credits https://github.com/antfu/releases.antfu.me/blob/main/app/components/TheItem.vue
const HighlightedVersion = defineComponent({
  props: {
    version: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const version = props.version
      const parts = version.split(/(\.)/g)

      let highlightedIndex = -1
      for (let i = parts.length - 1; i >= 0; i--) {
        if (parts[i] !== '.') {
          const num = +parts[i]!
          if (!Number.isNaN(num) && num > 0) {
            highlightedIndex = i
            break
          }
        }
      }

      const mergedParts = [
        parts.slice(0, highlightedIndex),
        parts.slice(highlightedIndex).join(''),
      ]

      const colors = [
        'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-700',
        'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-700',
        'text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-700',
        'text-teal-700 bg-teal-100  dark:text-teal-300 dark:bg-teal-700',
      ]
      const color = colors[Math.round(highlightedIndex / 2)] || colors[3]

      return h('span', ['v', ...mergedParts.map((part, i) => {
        if (i) {
          return h('span', { class: `${color} font-bold px-1 rounded` }, part)
        }
        return part
      })])
    }
  },
})
</script>

<template>
  <div>
    <div class="gradient" />
    <section class=" py-5 sm:py-12 xl:py-20">
      <UContainer>
        <UPageHeader title="Nuxt SEO Releases" description="See what has been shipping recently." />
        <div class="mt-3 dark:text-neutral-300 text-sm">
          Last fetched:
          {{ formatTimeAgo(new Date(stats.fetchedAt)) }}.
        </div>
        <div class="mt-3 dark:text-neutral-300 text-sm">
          Please use GitHub to check for realtime updates, this list is only updated every 24 hours.
        </div>
      </UContainer>
    </section>
    <section class="mb-14">
      <UContainer>
        <ul class="space-y-5">
          <li v-for="(release, key) in stats.allReleases" :key="key" class="lg:grid grid-cols-12">
            <div class="flex lg:block items-center gap-2 col-span-2 mb-2 lg:mb-0">
              <div class="lg:mb-2">
                <ModuleLabel :slug="release.slug" size="sm" />
              </div>
              <time class="text-sm opacity-75" :datatime="new Date(release.publishedAt).toString()">{{ formatTimeAgo(new Date(release.publishedAt)) }}</time>
            </div>
            <UCard class="col-span-8">
              <div class="text-2xl font-bold flex items-center gap-3">
                <HighlightedVersion :version="release.name.slice(1)" class="font-mono " />
                <UBadge v-if="stats.modules.find(m => m.slug === release.slug).version === release.name" size="lg" variant="outline" color="primary">
                  Latest
                </UBadge>
              </div>
              <MDC :value="release.body" />
            </UCard>
          </li>
        </ul>
        <div class="mt-10 text-center dark:text-neutral-300 text-sm">
          Please check GitHub for releases further back.
        </div>
      </UContainer>
    </section>
  </div>
</template>

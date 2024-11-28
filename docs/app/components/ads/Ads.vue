<script lang="ts" setup>
import { blueprintAd, proAd } from '~/utils/ads'

const possibleAds = computed(() => {
  return [{ id: 'pro', enabled: proAd.value }, { id: 'blueprint', enabled: blueprintAd.value }].filter(v => v.enabled)
})
// shuffle
const ad = computed(() => {
  if (possibleAds.value.length === 0)
    return null
  // if we're on mobile, show nothing
  if (import.meta.client && window.innerWidth < 640)
    return null
  return possibleAds.value[Math.floor(Math.random() * possibleAds.value.length)]
})
</script>

<template>
  <div class="w-full xl:fixed my-5 block xl:w-[200px] bottom-5 right-5 xl:block grid grid-cols-2 gap-5 ">
    <ClientOnly>
      <template v-if="ad">
        <div
          v-if="ad.id === 'pro'"
          class="Carbon border text-sm dark:text-gray-300 text-gray-700 border-gray-200 dark:border-gray-800 rounded-lg mb-5"
        >
          <div class="px-1 pt-1 mb-2 flex items-center justify-between">
            <strong>Nuxt SEO <span class="text-green-500">Pro</span></strong>
            <UButton class="cursor-pointer" size="xs" variant="ghost" color="neutral" type="button" @click="proAd = false">
              <UIcon name="i-carbon-close" />
            </UButton>
          </div>
          <ul class="px-1 list-disc text-sm ml-4 space-y-1 mb-3">
            <li>Nuxt Magic Redirects</li>
            <li>Nuxt Google Search Console</li>
            <li>Nuxt Internal Links</li>
            <li>Nuxt SEO Analyze</li>
          </ul>
          <div class="px-1">
            Save $130 by joining the <NuxtLink to="/pro" class="underline text-green-500">
              waitlist
            </NuxtLink> now.
          </div>
        </div>
        <div
          v-else-if="ad.id === 'blueprint'"
          class="Carbon border text-sm dark:text-gray-300 text-gray-700 border-gray-200 dark:border-gray-800 rounded-lg mb-5"
        >
          <div class="px-1 pt-1 mb-2 flex items-center justify-between">
            <strong>SEO <span class="text-green-500">Blueprint</span></strong>
            <UButton class="cursor-pointer" size="xs" variant="ghost" color="neutral" type="button" @click="blueprintAd = false">
              <UIcon name="i-carbon-close" />
            </UButton>
          </div>
          <ul class="px-1 list-disc text-sm ml-4 space-y-1 mb-3">
            <li>2hr 58min video course</li>
            <li>Get your website to #1</li>
            <li>For beginners and professionals</li>
            <li>By Nuxt IndieHacker Danny Postma</li>
          </ul>
          <div class="px-1">
            <NuxtLink to="https://www.dannypostma.com/seo-course?via=harlan" class="underline text-green-500">
              See course outline
            </NuxtLink>
          </div>
        </div>
      </template>
    </ClientOnly>
    <ScriptCarbonAds
      :key="$route.path"
      class="xl:min-h-[265px] Carbon border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-white/5"
      serve="CW7DTKJJ"
      placement="nuxtseocom"
      trigger="onNuxtReady"
    >
      <AdsFallback />
    </ScriptCarbonAds>
  </div>
</template>

<style>
.dark .Carbon .carbon-text {
  color: #9ca3af; /* text-gray-400 */
}
.dark .Carbon .carbon-text:hover {
  color: #e5e7eb; /* text-gray-200 */
}

.light .Carbon .carbon-text {
  color: #4b5563; /* text-gray-600 */
}
.light .Carbon .carbon-text:hover {
  color: #1f2937; /* text-gray-800 */
}

.Carbon {
  padding: 0.5rem; /* p-2 */
  display: flex;
  flex-direction: column;
  max-width: 100%;
}
@media (min-width: 640px) {
  .Carbon {
    max-width: 20rem; /* max-w-xs */
  }
}
@media (min-width: 1024px) {
  .Carbon {
    margin-top: 0; /* mt-0 */
  }
}

#carbonads span {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
#carbonads span .carbon-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
}
@media (min-width: 320px) {
  #carbonads span .carbon-wrap {
    flex-direction: row;
  }
}
@media (min-width: 1024px) {
  #carbonads span .carbon-wrap {
    flex-direction: column;
  }
}
#carbonads span .carbon-wrap .carbon-img {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 0.5rem; /* mb-2 */
}
@media (min-width: 320px) {
  #carbonads span .carbon-wrap .carbon-img {
    margin-bottom: 0; /* mb-0 */
  }
}
@media (min-width: 1024px) {
  #carbonads span .carbon-wrap .carbon-img {
    margin-bottom: 1rem; /* mb-4 */
  }
}
#carbonads span .carbon-wrap .carbon-text {
  flex: 1;
  font-size: 0.875rem; /* text-sm */
  width: 100%;
  margin: 0;
  text-align: left;
  display: block;
}
#carbonads span .carbon-wrap .carbon-text:hover {
  text-decoration: none; /* no-underline */
}
@media (min-width: 320px) {
  #carbonads span .carbon-wrap .carbon-text {
    margin-left: 1rem; /* ml-4 */
  }
}
@media (min-width: 1024px) {
  #carbonads span .carbon-wrap .carbon-text {
    margin-left: 0; /* ml-0 */
  }
}

.Carbon img {
  width: 100%;
}

.Carbon .carbon-poweredby {
  margin-left: 0.5rem; /* ml-2 */
  font-size: 0.75rem; /* text-xs */
  text-align: right;
  color: #9ca3af; /* text-gray-400 */
  display: block;
  padding-top: 0.5rem; /* pt-2 */
}
.Carbon .carbon-poweredby:hover {
  text-decoration: none; /* no-underline */
  color: #6b7280; /* text-gray-500 */
}
</style>

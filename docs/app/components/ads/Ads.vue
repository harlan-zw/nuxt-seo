<script lang="ts" setup>
import { useLocalStorage } from '@vueuse/core'

const storage = useLocalStorage('nuxt-seo-pro-ad', true)

function closeNuxtProAd() {
  storage.value = false
}
</script>

<template>
  <div>
    <div
      v-if="storage"
      class="Carbon border p-3 text-sm dark:text-gray-300 text-gray-700 border-gray-200 dark:border-gray-800 rounded-lg  mb-7"
    >
      <div class="mb-2 flex items-center justify-between">
        <strong>Nuxt SEO <span class="text-green-500">Pro</span></strong>
        <UButton class="cursor-pointer" size="xs" variant="ghost" color="neutral" type="button" @click="closeNuxtProAd">
          <UIcon name="i-carbon-close" />
        </UButton>
      </div>
      <ul class="list-disc text-sm ml-4 space-y-1 mb-3">
        <li>Nuxt Redirects</li>
        <li>Nuxt Google Search Console</li>
        <li>Nuxt Internal Links</li>
        <li>Nuxt SEO Analyze</li>
      </ul>
      <div>
        Save $170 on the <NuxtLink to="/pro" class="underline text-green-500">
          presale
        </NuxtLink> now.
      </div>
    </div>
    <ScriptCarbonAds
      :key="$route.path"
      class="Carbon border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50/50 dark:bg-white/5"
      serve="CW7DTKJJ"
      placement="nuxtseocom"
      trigger="scroll"
    >
      <AdsFallback />
    </ScriptCarbonAds>
  </div>
</template>

<style>
.dark .Carbon {
  min-height: 220px;
}
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

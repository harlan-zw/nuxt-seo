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

<style lang="postcss">
.dark .Carbon {
  min-height: 220px;
  .carbon-text {
    @apply text-gray-400;

    &:hover {
      @apply text-gray-200;
    }
  }
}

.light .Carbon {
  .carbon-text {
    @apply text-gray-600;

    &:hover {
      @apply text-gray-800;
    }
  }
}

.Carbon {
  @apply p-2 flex flex-col max-w-full;

  @screen sm {
    @apply max-w-xs;
  }

  @screen lg {
    @apply mt-0;
  }

  #carbonads span {
    @apply flex flex-col justify-between;

    .carbon-wrap {
      @apply flex flex-col;

      flex: 1;

      @media (min-width: 320px) {
        @apply flex-row;
      }

      @screen lg {
        @apply flex-col;
      }

      .carbon-img {
        @apply flex items-start justify-center mb-2;

        @media (min-width: 320px) {
          @apply mb-0;
        }

        @screen lg {
          @apply mb-4;
        }
      }

      .carbon-text {
        @apply flex-1 text-sm w-full m-0 text-left block;

        &:hover {
          @apply no-underline;
        }

        @media (min-width: 320px) {
          @apply ml-4;
        }

        @screen lg {
          @apply ml-0;
        }
      }
    }
  }

  img {
    @apply w-full;
  }

  & .carbon-poweredby {
    @apply ml-2 text-xs text-right text-gray-400 block pt-2;

    &:hover {
      @apply no-underline text-gray-500;
    }
  }
}
</style>

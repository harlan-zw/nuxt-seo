<script setup>
import { computed } from 'vue'

const props = defineProps({
  colorMode: { type: String, required: false, default: 'light' },
  title: { type: String, required: false, default: 'title' },
  description: { type: String, required: false },
  isPro: { type: Boolean, required: false },
  width: { type: Number, required: false, default: 1200 },
  height: { type: Number, required: false, default: 600 },
})
const themeColor = computed(() => props.isPro ? '124, 58, 237' : '34, 197, 94')
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-center items-center relative p-10 lg:p-[60px] bg-white text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50"
  >
    <!-- Gradient background -->
    <div
      class="absolute top-0 left-0 right-0 bottom-0" :style="{
        backgroundImage: `radial-gradient(at 100% 100%, rgba(${themeColor}, 0.15), transparent)`,
      }"
    />
    <div
      class="absolute top-0 left-0 right-0 bottom-0" :style="{
        backgroundImage: `radial-gradient(at 0% 0%, rgba(${themeColor}, 0.1), transparent)`,
      }"
    />

    <div class="relative flex flex-col items-center text-center gap-5 lg:gap-8">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <svg viewBox="0 0 64 64" class="w-10 h-10 lg:w-16 lg:h-16">
          <defs>
            <linearGradient :id="isPro ? 'nsLine2' : 'nsLine1'" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" />
              <stop offset="100%" :stop-color="isPro ? '#c4b5fd' : '#86efac'" />
            </linearGradient>
            <linearGradient :id="isPro ? 'nsFill2' : 'nsFill1'" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" stop-opacity="0.6" />
              <stop offset="100%" :stop-color="isPro ? '#7c3aed' : '#22c55e'" stop-opacity="0" />
            </linearGradient>
          </defs>
          <path d="M8 52 Q20 48 24 36 T40 20 T56 12 L56 56 L8 56 Z" :fill="`url(#${isPro ? 'nsFill2' : 'nsFill1'})`" />
          <path d="M8 52 Q20 48 24 36 T40 20 T56 12" fill="none" :stroke="`url(#${isPro ? 'nsLine2' : 'nsLine1'})`" stroke-width="4" stroke-linecap="round" />
          <circle cx="56" cy="12" r="6" :fill="`url(#${isPro ? 'nsLine2' : 'nsLine1'})`" />
        </svg>
        <span class="text-[32px] lg:text-[42px] font-bold tracking-tight">
          Nuxt<span :class="isPro ? 'text-violet-500' : 'text-green-500'" class="ml-2">SEO{{ isPro ? " Pro" : "" }}</span>
        </span>
      </div>

      <div class="items-center justify-center w-full">
        <!-- Title -->
        <h1
          class="text-[48px] lg:text-[80px] font-bold m-0 leading-tight max-w-[700px] lg:max-w-[1000px]"
          style="display: block; line-clamp: 3; text-overflow: ellipsis; text-wrap: balance;"
        >
          {{ title }}
        </h1>
      </div>

      <!-- Description -->
      <p v-if="description" class="text-[24px] lg:text-[32px] opacity-70 max-w-[650px] lg:max-w-[900px] leading-relaxed">
        {{ description }}
      </p>
    </div>
  </div>
</template>

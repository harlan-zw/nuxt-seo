<script setup lang="ts">
import { computed } from 'vue'

// convert to typescript props
const props = withDefaults(defineProps<{
  colorMode?: 'dark' | 'light'
  title?: string
  description?: string
  icon?: string | boolean
  version?: string
  moduleName?: string
  theme?: string
}>(), {
  colorMode: 'light',
  theme: '#00dc82',
  title: 'title',
})

const HexRegex = /^#([0-9a-f]{3}){1,2}$/i

const themeHex = computed(() => {
  // regex test if valid hex
  if (HexRegex.test(props.theme))
    return props.theme

  // if it's hex without the hash, just add the hash
  if (HexRegex.test(`#${props.theme}`))
    return `#${props.theme}`

  // if it's rgb or rgba, we convert it to hex
  if (props.theme.startsWith('rgb')) {
    const rgb = props.theme
      .replace('rgb(', '')
      .replace('rgba(', '')
      .replace(')', '')
      .split(',')
      .map(v => Number.parseInt(v.trim(), 10))
    const hex = rgb
      .map((v) => {
        const hex = v.toString(16)
        return hex.length === 1 ? `0${hex}` : hex
      })
      .join('')
    return `#${hex}`
  }
  return '#FFFFFF'
})

const themeRgb = computed(() => {
  // we want to convert it so it's just `<red>, <green>, <blue>` (255, 255, 255)
  return themeHex.value
    .replace('#', '')
    .match(/.{1,2}/g)
    ?.map(v => Number.parseInt(v, 16))
    .join(', ')
})
</script>

<template>
  <div
    class="w-full h-full flex justify-between relative p-[60px]"
    :class="[
      colorMode === 'light' ? ['bg-white', 'text-gray-900'] : ['bg-gray-900', 'text-gray-50'],
    ]"
  >
    <div
      class="flex absolute right-[-110%]" :style="{
        width: '200%',
        height: '250%',
        backgroundImage: `radial-gradient(circle, rgba(${themeRgb}, 0.5) 0%,  ${colorMode === 'dark' ? 'rgba(5, 5, 5,0.3)' : 'rgba(255, 255, 255, 0.7)'} 50%, ${props.colorMode === 'dark' ? 'rgba(5, 5, 5,0)' : 'rgba(255, 255, 255, 0)'} 70%)`,
      }"
    />
    <div class="h-full w-full relative">
      <div class="flex flex-row justify-between items-center">
        <div class="text-[40px] flex items-center gap-3 flex-row">
          <Icon class="text-blue-500 w-20 h-20" :name="icon" />
          <div>
            <div class="text-[40px] font-mono">
              {{ moduleName }}
            </div>
            <div class="text-[30px] opacity-70">
              v{{ version }}
            </div>
          </div>
        </div>
        <div class="flex flex-row items-center">
          <svg height="30" width="30" class="mr-3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path :fill="theme.includes('#') ? theme : `#${theme}`" d="M62.3,-53.9C74.4,-34.5,73.5,-9,67.1,13.8C60.6,36.5,48.7,56.5,30.7,66.1C12.7,75.7,-11.4,74.8,-31.6,65.2C-51.8,55.7,-67.9,37.4,-73.8,15.7C-79.6,-6,-75.1,-31.2,-61.1,-51C-47.1,-70.9,-23.6,-85.4,0.8,-86C25.1,-86.7,50.2,-73.4,62.3,-53.9Z" transform="translate(100 100)" />
          </svg>
          <div class="text-[50px] flex flex-row gap-2 font-semibold">
            <span>Nuxt</span>
            <span class="text-green-500">SEO</span>
          </div>
        </div>
      </div>
      <div class="flex-grow flex items-center justify-start">
        <div class="max-w-[800px] flex justify-center gap-7 flex-col">
          <h1 class="text-[60px] max-w-[700px] font-bold m-0">
            {{ title }}
          </h1>
          <p class="text-[32px] leading-[45px] max-w-[800px] opacity-90 font-normal m-0">
            {{ description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

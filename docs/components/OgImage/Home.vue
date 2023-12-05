<script setup lang="ts">
import { computed } from 'vue'

// convert to typescript props
const props = withDefaults(defineProps<{
  colorMode?: 'dark' | 'light'
  title?: string
  description?: string
  icon?: string | boolean
  version?: string
  siteName?: string
  siteLogo?: string
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

const modules = useModuleList()
</script>

<template>
  <div
    class="w-full h-full flex justify-between relative p-[60px]"
    :class="[
      colorMode === 'light' ? ['bg-white', 'text-gray-900'] : ['bg-gray-900', 'text-gray-50'],
    ]"
  >
    <div
      class="flex absolute bottom-[-200%] right-[-50%]" :style="{
        width: '200%',
        height: '250%',
        backgroundImage: `radial-gradient(circle, rgba(${themeRgb}, 0.5) 0%,  ${colorMode === 'dark' ? 'rgba(5, 5, 5,0.3)' : 'rgba(255, 255, 255, 0.7)'} 50%, ${props.colorMode === 'dark' ? 'rgba(5, 5, 5,0)' : 'rgba(255, 255, 255, 0)'} 70%)`,
      }"
    />
    <div class="h-full w-full justify-between relative">
      <div class="flex flex-row justify-center items-center text-left w-full">
        <svg height="30" width="30" class="mr-3" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path :fill="theme.includes('#') ? theme : `#${theme}`" d="M62.3,-53.9C74.4,-34.5,73.5,-9,67.1,13.8C60.6,36.5,48.7,56.5,30.7,66.1C12.7,75.7,-11.4,74.8,-31.6,65.2C-51.8,55.7,-67.9,37.4,-73.8,15.7C-79.6,-6,-75.1,-31.2,-61.1,-51C-47.1,-70.9,-23.6,-85.4,0.8,-86C25.1,-86.7,50.2,-73.4,62.3,-53.9Z" transform="translate(100 100)" />
        </svg>
        <p class="text-[60px] font-semibold">
          <span class="mr-5">Nuxt</span>
          <span class="text-green-500">SEO</span>
        </p>
      </div>
      <div class="flex justify-center gap-7">
        <Icon v-for="(module, key) in modules" :key="key" class="text-blue-300 w-[90px] h-[90px]" :name="module.icon" />
      </div>
      <div class="flex flex-row justify-center">
        <div class="flex justify-center items-center gap-3 flex-row text-[30px] text-purple-600 ">
          <p class="bg-purple-50 gap-3 items-center border-1 border-purple-400 px-4 py-1.5 rounded-full flex justify-center">
            <Icon name="carbon:version-minor" class="w-8 h-8 text-purple-500" />
            <span>v{{ version }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

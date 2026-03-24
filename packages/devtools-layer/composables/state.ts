import { useDebounceFn, useLocalStorage } from '@vueuse/core'
import { hasProtocol, withBase } from 'ufo'
import { computed, ref } from 'vue'

export const refreshTime = ref(Date.now())

export const hostname = window.location.host
export const path = ref('/')
export const query = ref()
export const base = ref('/')

// Standalone mode state
export const standaloneUrl = useLocalStorage<string>('nuxt-seo:standalone-url', '')
export const isConnected = ref(false)
export const isStandalone = computed(() => !isConnected.value && !!standaloneUrl.value)

export const host = computed(() => {
  if (isStandalone.value)
    return standaloneUrl.value
  return withBase(base.value, `${window.location.protocol}//${hostname}`)
})

export const refreshSources = useDebounceFn(() => {
  refreshTime.value = Date.now()
}, 200)

export const slowRefreshSources = useDebounceFn(() => {
  refreshTime.value = Date.now()
}, 1000)

// Production preview state
export const previewSource = useLocalStorage<'local' | 'production'>('nuxt-seo:preview-source', 'local')
export const productionUrl = ref<string>('')

export const hasProductionUrl = computed(() => {
  const url = productionUrl.value
  if (!url || !hasProtocol(url))
    return false
  return !url.includes('localhost') && !url.includes('127.0.0.1')
})

export const isProductionMode = computed(() => previewSource.value === 'production' && hasProductionUrl.value)

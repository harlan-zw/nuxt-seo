<script lang="ts" setup>
import type { modules } from '../../../src/const'
import { toRefs } from 'vue'
import { movingAverage } from '~/composables/data'
import { humanNumber } from '~/composables/format'
import { useModule } from '~/composables/module'

const { version = true, module: _module, slug, size = 'md' } = defineProps<{
  module?: any
  slug?: typeof modules[number]['slug']
  size?: 'sm' | 'md' | 'lg'
  version?: boolean
}>()

// as refs
const propsAsRefs = toRefs(reactive({
  module: _module,
  slug,
  size,
  version,
}))

const module = _module ? propsAsRefs.module : useModule((await useStats()).value.modules, propsAsRefs.slug)

const iconAttrs = computed(() => {
  switch (size) {
    case 'sm': return { class: 'w-4 h-4' }
    case 'md': return { class: 'w-6 h-6' }
    case 'lg': return { class: 'w-5 h-5' }
    default: return {}
  }
})

const windowSize = ref(8)
const smoothCurveDownloads = computed(() => {
  // we want to show the curve when it's above the 80% of the average
  const threshold = module.value?.averageDownloads90 - (module.value?.averageDownloads90 / 100 * (windowSize.value * 3.5))
  // we need to smooth the curve
  return movingAverage(
    module.value?.downloads?.map(m => m.downloads).filter(d => windowSize.value > 1 ? d >= threshold : true) || [],
    windowSize.value,
  )
})
const chartWidth = ref(250)
const container = useTemplateRef('container')
onMounted(() => {
  chartWidth.value = container.value.$el.offsetWidth
})
</script>

<template>
  <NuxtLink ref="container" :to="`/docs/${module.slug}/getting-started/introduction`" class="group hover:shadow-[0_0_15px_5px_rgba(20,255,209,0.05)] transition-all relative min-w-[250px] h-[120px] inline-flex transition-all flex-col rounded-lg font-bold border bg-gradient-to-r from-sky-700/10 to-blue-700/20 border-sky-700/20 px-2 py-2 gap-1" @mouseenter="windowSize = 1" @mouseleave="windowSize = 8">
    <div class="absolute bottom-0 left-0 w-full">
      <ClientOnly>
        <ChartDownloadsSmall :width="chartWidth" :value="smoothCurveDownloads" />
      </ClientOnly>
    </div>
    <div class="z-1 flex flex-col justify-between h-full">
      <div>
        <div class="flex justify-between">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center gap-1">
              <div class="flex items-center gap-1">
                <UIcon v-if="module.icon" dynamic :name="module.icon" class="text-blue-500 dark:text-blue-300" v-bind="iconAttrs" />{{ module.label }}
                <UTooltip text="Latest version">
                  <UBadge v-if="version" variant="soft" size="sm" color="secondary" class="ml-1">
                    {{ module.version }}
                  </UBadge>
                </UTooltip>
              </div>
              <div>
                <div class="flex items-end gap-2">
                  <div>
                    <UTooltip text="Downloads in last 90 days.">
                      <div class="justify-end dark:text-neutral-500 text-[10px] text-neutral-700/75 inline-flex items-center gap-[2px]">
                        <UIcon name="i-carbon-download" class="w-3 h-3 " />
                        <div class="font-mono font-normal">
                          {{ humanNumber(module.totalDownloads90) }}
                        </div>
                      </div>
                    </UTooltip>
                  </div>
                  <div>
                    <UTooltip text="GitHub Stars">
                      <div class="justify-end dark:bg-yellow-700/20 dark:text-yellow-500 text-[10px] px-1 py-0.5 rounded ring-yellow-700/30  ring bg-yellow-50 text-yellow-700/95 inline-flex items-center gap-[2px]">
                        <UIcon name="i-carbon-star" class="w-3 h-3 " />
                        <div class="font-mono font-normal">
                          {{ humanNumber(module.stars) }}
                        </div>
                      </div>
                    </UTooltip>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-xs text-(--ui-text-muted) font-normal">
              {{ module.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

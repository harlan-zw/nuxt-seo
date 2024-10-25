<script setup lang="ts">
import type { TocLink } from '@nuxt/content'
import type { PropType } from 'vue'

defineOptions({
  inheritAttrs: false,
})

defineProps({
  links: {
    type: Array as PropType<TocLink[]>,
    default: () => [],
  },
  class: {
    type: [String, Object, Array] as PropType<any>,
    default: undefined,
  },
  ui: {
    type: Object as PropType<Partial<typeof config>>,
    default: () => ({}),
  },
})

const emit = defineEmits(['move'])

const config = {
  wrapper: 'space-y-1',
  base: 'inline-block text-base truncate',
  active: 'text-primary',
  inactive: 'text-gray-500 transition dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200',
  depth: 'ml-3',
}

const router = useRouter()
// const { ui, attrs } = useUI('content.toc.links', toRef(props, 'ui'), config, toRef(props, 'class'), true)

function scrollToHeading(id: string) {
  const encodedId = encodeURIComponent(id)
  router.push(`#${encodedId}`)
  emit('move', id)
}
</script>

<template>
  <ul v-if="links?.length" :class="config.wrapper">
    <li v-for="link in links" :key="link.text" :class="[config.wrapper, link.depth === 3 && config.depth]">
      <a
        :href="`#${link.id}`"
        :class="[config.base, config.inactive]"
        @click.prevent="scrollToHeading(link.id)"
      >
        <span class="text-blue-300 mr-px">#</span> {{ link.text }}
      </a>

      <TableOfContents v-if="link.children" :links="link.children" :ui="config" />
    </li>
  </ul>
</template>

<script setup lang="ts">
const uiElements = [
  {
    label: 'Breadcrumb',
    description: 'A breadcrumb trail for indicating the current page location within a navigational hierarchy.',
    tag: {
      label: 'v0.x',
    },
    to: '/ui/elements/breadcrumb',
  },
  {
    label: 'Review',
    description: 'A review of an item such as a restaurant, movie, or store.',
  },
  {
    label: 'FAQ',
    description: 'A list of frequently asked questions.',
  },
  {
    label: 'Carousel',
    description: 'A slideshow component for cycling through elements—images or slides of text—like a carousel.',
  },
  {
    label: 'Image',
    description: 'An image.',
  },
  {
    label: 'Video',
    description: 'A video.',
  },
]

useHead({ title: 'UI' })

definePageMeta({
  breadcrumbTitle: 'UI',
})

const breadcrumbUi = {
  nav: 'max-w-full block mb-0',
  ol: 'max-w-full flex justify-center gap-2 m-0 p-0 list-none',
  li: 'inline-flex relative items-center justify-center text-xl whitespace-nowrap leading-tight group',
  liLast: 'overflow-hidden',
  liMultiLine: 'w-full',
  item: {
    icon: 'text-gray-600 dark:text-gray-400 h-6 w-6 group-hover:opacity-80 transition-all',
    iconWithLabel: 'mr-1',
    default: 'mt-0 mb-0 relative text-gray-600 inline-flex items-center dark:text-gray-400 focus:underline hover:underline hover:text-gray-700',
    current: 'text-gray-700 leading-loose font-bold dark:text-gray-400 hover:none',
    disabled: 'text-gray-400 dark:text-gray-700 outline-none',
    separator: 'ml-2 text-gray-400 dark:text-gray-600',
    last: 'overflow-hidden text-ellipsis truncate !block',
  },
}
</script>

<template>
  <div>
    <Gradient class="absolute w-full left-0 top-0 z-[-1]" />
    <section class="py-5 sm:py-10 xl:py-20">
      <h2 class="mb-10 text-3xl font-title">
        UI Elements
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <ShowcaseCard v-for="(module, key) in uiElements" v-bind="module" :key="key" class="group">
          <div v-if="module.label === 'Breadcrumb'">
            <SBreadcrumb :items="[{ to: '/', ariaLabel: 'Home', icon: 'material-symbols:home-outline-rounded' }, { to: '/ui', label: 'UI', current: true }, { to: '/ui/breadcrumbs', label: 'Breadcrumb' }]" :ui="breadcrumbUi" multiline />
          </div>
          <template v-if="module.icon">
            <Icon :name="module.icon" size="150" :class="module.label === 'Robots' ? ['transition group-hover:opacity-0'] : []" />
          </template>
        </ShowcaseCard>
      </div>
    </section>
  </div>
</template>

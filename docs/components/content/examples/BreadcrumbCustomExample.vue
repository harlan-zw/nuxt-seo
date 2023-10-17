<script lang="ts" setup>
const items = useBreadcrumbItems()
const ui = {
  nav: 'max-w-full block mb-0',
  ol: 'max-w-full flex justify-start gap-2 m-0 p-0 list-none border-blue-100 border-2 px-3 py-2 dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden',
  li: 'inline-flex relative items-center justify-start text-sm whitespace-nowrap leading-loose group',
  liLast: 'overflow-hidden',
  liMultiLine: 'w-full',
  item: {
    icon: 'text-blue-300 dark:text-gray-400 h-5 w-5 group-hover:opacity-80 transition-all',
    iconWithLabel: 'mr-1',
    default: 'mt-0 mb-0 relative text-gray-600 inline-flex items-center dark:text-gray-400 focus:underline hover:underline hover:text-gray-700',
    current: 'text-blue-700 leading-loose font-bold dark:text-gray-400 hover:none',
    disabled: 'text-gray-400 dark:text-gray-700 outline-none',
    separator: 'ml-2 text-blue-400 dark:text-gray-600',
    last: 'overflow-hidden text-ellipsis truncate !block',
  },
}
</script>

<template>
  <SBreadcrumb :items="items" :ui="ui" />
</template>

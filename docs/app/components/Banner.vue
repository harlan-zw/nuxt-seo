<template>
  <UBanner :actions="[{ label: 'Read the announcement post', to: 'https://ui.nuxt.com', trailingIcon: 'i-heroicons-arrow-right-20-solid', class: 'rounded-full' }]" :close="false">
    <template #title>
      <UIcon name="i-noto-party-popper" class="mr-2" />
      <span class="font-semibold">Nuxt SEO v2 stable is here!</span>
    </template>
  </UBanner>
</template>

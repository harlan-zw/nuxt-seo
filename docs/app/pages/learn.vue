<script setup lang="ts">
definePageMeta({
  breadcrumb: {
    icon: 'i-heroicons-home',
    ariaLabel: 'Learn',
  },
})
</script>

<template>
  <div>
    <Gradient class="absolute w-full left-0 top-0 z-[-1]" />
    <ULandingHero
      description="Learn the basics on how to use Nuxt SEO to its full potential."
    >
      <template #title>
        <div>A humble SEO course for Nuxt developers.</div>
      </template>
      <template #headline>
        <UButton
          color="gray"
          to="https://volta.net/changelog"
          label="Coming soon"
          trailing-icon="i-heroicons-arrow-right"
          size="xs"
          class="rounded-full"
        />
      </template>
      <template #default>
        <img
          src="https://picsum.photos/640/360"
          class="w-full rounded-md shadow-xl ring-1 ring-gray-300 dark:ring-gray-700"
        >
      </template>
    </ULandingHero>

    <ULandingSection>
      <UPricingGrid>
        <UPricingCard />
        <UPricingCard />
        <UPricingCard />
      </UPricingGrid>
    </ULandingSection>

    <ULandingSection>
      <ULandingLogos />
    </ULandingSection>

    <ULandingSection>
      <ULandingFAQ />
    </ULandingSection>
  </div>
</template>

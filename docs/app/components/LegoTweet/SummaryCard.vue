<script setup lang="ts">
import key from './.keys'

const tweet = inject(key)
const card = computed(() => tweet?.value?.card)
const isLargeSummaryCard = computed(
  () => card.value?.name === 'summary_large_image',
)

const image = computed(() =>
  isLargeSummaryCard.value
    ? card.value?.binding_values?.summary_photo_image?.image_value
    : card.value?.binding_values?.thumbnail_image?.image_value,
)
const info = computed(() => ({
  domain: card.value?.binding_values.domain.string_value,
  title: card.value?.binding_values.title.string_value,
  description: card.value?.binding_values.description.string_value,
}))
</script>

<template>
  <div v-if="card && image && info">
    <LegoTweetLink
      :href="card?.url"
      :class="{ is_small_card: !isLargeSummaryCard }"
    >
      <img
        :style="{
          height: image.height,
          width: image.width,
        }"
        :src="image.url"
        :alt="card?.name"
      >

      <slot
        :domain="info.domain"
        :title="info.title"
        :description="info.description"
        :is_large_summary_card="isLargeSummaryCard"
      >
        <p>{{ info?.domain }}</p>
        <p>{{ info?.title }}</p>
        <p>{{ info?.description }}</p>
      </slot>
    </LegoTweetLink>
  </div>
</template>

<style>
.is_small_card {
  display: flex;
  align-items: center;
}
</style>

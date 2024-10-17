<script setup lang="ts">
import key from './.keys'

const tweet = inject(key)
const mediaDetails = computed(() => tweet?.value?.mediaDetails ?? [])

const gridClass = computed(() => {
  const length = mediaDetails.value.length
  if (length >= 4)
    return 'grid-2x2'
  else if (length === 3)
    return 'grid-3'
  else if (length > 1)
    return 'grid-2-columns'
  return ''
})
</script>

<template>
  <div v-if="mediaDetails.length" :class="gridClass">
    <template v-for="(media, index) in mediaDetails" :key="index">
      <LegoTweetMediaPhoto v-if="media.type === 'photo'" :media="media" />
      <LegoTweetMediaVideo v-if="media.type === 'video'" :media="media" />
    </template>
  </div>
</template>

<style>
.grid-3 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 145px);
  grid-gap: 1px;
}
.grid-3 > :first-child {
  grid-row: span 2;
}
.grid-2x2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 145px);
  grid-gap: 1px;
}
.grid-2-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 1px;
}
</style>

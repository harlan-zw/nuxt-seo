<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="root max-h-full relative flex">
    <div class="max-h-full border-1 border-solid border-[#cfd9de] rounded-[16px] overflow-hidden">
      <div class="image-wrap">
        <slot />
      </div>
    </div>
    <div v-if="title" class="title absolute bottom-3 z-2 left-3 text-white">
      <slot name="title">
        {{ title }}
      </slot>
    </div>
    <div class="domain absolute -bottom-5 z-2 left-0">
      <slot name="domain" />
    </div>
  </div>
</template>

<style scoped>
.image-wrap {
  aspect-ratio: 2 / 1;
  background-color: rgba(0, 0, 0, 0.1);
  opacity: 1;
  height: 300px;
}
.domain:hover {
  text-decoration: underline;
}
.domain {
  line-height: 16px;
  cursor: pointer;
  min-width: 0px;
  word-wrap: break-word;
  text-overflow: unset;
  color: rgb(83, 100, 113);
  font-weight: 400;
  background-color: rgba(0,0,0,0.00);
  border: 0 solid black;
  box-sizing: border-box;
  display: inline;
  font: 13px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  list-style: none;
  margin: 0px;
  padding: 0px;
  text-align: inherit;
  text-decoration: none;
  white-space: pre-wrap;
}
.title {
  word-wrap: break-word;
  text-overflow: unset;
  min-width: 0px;
  line-height: 16px;
  font-weight: 400;
  user-select: none;
  font-size: 13px;
  text-align: center;
  height: 20px;
  padding: 0 4px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.77);
}
.root {
  outline-style: none;
  cursor: pointer;
  transition-duration: 0.2s;
}
</style>

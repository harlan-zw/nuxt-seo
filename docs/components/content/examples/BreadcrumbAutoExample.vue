<script lang="ts" setup>
import { ref, useBreadcrumbItems, useBreadcrumbsUi } from '#imports'

const path = ref('/blog/my-awesome-article')

const items = useBreadcrumbItems({ path })
const breadcrumbUi = useBreadcrumbsUi()
</script>

<template>
  <div>
    <SBreadcrumb id="sub" :items="items" :ui="breadcrumbUi" class="mb-5" />
    <input v-model="path" type="text" class="max-w-full rounded border-gray-300 border-2 px-3 py-1">
  </div>
</template>

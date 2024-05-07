<script lang="ts" setup>
import { ref, useBreadcrumbItems } from '#imports'

const { data } = await useAsyncData('nuxt-ui-example', () => queryContent('/nuxt-seo/api/_breadcrumb-nuxt-ui').findOne())

const path = ref('/nuxt-seo/api/breadcrumbs')

const hideRoot = ref(false)
const hideCurrent = ref(false)
const items = useBreadcrumbItems({ path, hideRoot, hideCurrent })
</script>

<template>
  <div class="mx-3">
    <p class="text-sm">
      This demo integrates directly with the <a href="https://ui.nuxt.com/navigation/breadcrumb">Nuxt UI Breadcrumb</a> component.
    </p>
    <div class="not-prose">
      <div class="flex justify-center border-2 mb-5 rounded border-solid border-gray-100 p-5">
        <UBreadcrumb id="sub" :links="items" class="not-prose " />
      </div>
      <div class="flex items-start gap-5 ">
        <div>
          <UInput v-model="path" type="text" class="mb-2" />
          <div class="mx-2 text-xs opacity-60">
            Enter any path and watch the breadcrumbs be generated!
          </div>
        </div>
        <div class="flex items-center space-x-4 text-sm mt-2">
          <label>Hide Root
            <UToggle v-model="hideRoot" />
          </label>
          <label>Hide Current
            <UToggle v-model="hideCurrent" label="Hide Current" />
          </label>
        </div>
      </div>
    </div>
    <ContentRenderer :value="data" />
  </div>
</template>

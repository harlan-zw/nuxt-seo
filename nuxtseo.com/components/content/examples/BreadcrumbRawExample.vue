<script lang="ts" setup>
import { ref, useBreadcrumbItems } from '#imports'

const { data } = await useAsyncData('raw-example', () => queryContent('/nuxt-seo/api/_breadcrumb-raw').findOne())

const path = ref('/nuxt-seo/api/breadcrumbs')

const hideRoot = ref(false)
const hideCurrent = ref(false)
const items = useBreadcrumbItems({ path, hideRoot, hideCurrent })
</script>

<template>
  <div class="mx-3 pt-5">
    <div class="not-prose">
      <div class="flex justify-center border-2 mb-5 rounded border-solid border-gray-100 p-5">
        <nav aria-label="Breadcrumbs">
          <ul>
            <li v-for="(item, key) in items" :key="key">
              <NuxtLink v-bind="item">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
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
          <label>Hiden Current
            <UToggle v-model="hideCurrent" label="Hide Current" />
          </label>
        </div>
      </div>
    </div>
    <ContentRenderer :value="data" />
  </div>
</template>

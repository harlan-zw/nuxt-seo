<script lang="ts" setup>
interface BreadcrumbsProps {
  /** should breadcrumbs render when there's only '/' in the list  */
  showAtRoot?: boolean
  /** should breadcrumbs use @nuxtjs/i18n module integration for title names?
   *
   *  when title is not found in meta, it will use `pages.<path>.<to>.<file>` notion as translation key
   */
  useI18n?: boolean
  /** Can only be used along with `useI18n` prop.
   *
   * When set, language root path will be available in breadcrumbs.
   *
   * Example:
   *
   * when `true`: `'/'`, `'/en/'`, `'/en/about-us'`
   *
   * when `false`: `'/'`, `'/en/about-us'`
   */
  keepLangPrefix?: boolean
  /** The translation key prefix for breadcrumbs. defaults to `"pages"`. Example result for `pages/index.vue` is `pages.index` */
  translationPrefix?: string
}

const props = defineProps<BreadcrumbsProps>()
const breadcrumbs = useBreadcrumbs(props)
const schemaBreadcrumbs = computed(() => breadcrumbs.value.map(breadcrumb => breadcrumb.schema))

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: schemaBreadcrumbs,
  }),
])
</script>

<template>
  <nav aria-label="Breadcrumb">
    <ul v-if="showAtRoot || breadcrumbs.length > 1">
      <template
        v-for="(item, key) in breadcrumbs"
        :key="key"
      >
        <li>
          <slot name="breadcrumb" :to="item.to" :title="item.title" :last="key === breadcrumbs.length - 1" :first="key === 0">
            <NuxtLink :to="item.to">
              {{ item.title }}
            </NuxtLink>
          </slot>
        </li>
      </template>
    </ul>
  </nav>
</template>

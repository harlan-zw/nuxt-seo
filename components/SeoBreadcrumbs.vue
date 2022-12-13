<script lang="ts" setup>
const breadcrumbs = useBreadcrumbs()
</script>

<template>
  <nav
    v-if="breadcrumbs.length > 1"
    aria-label="Breadcrumb"
  >
    <ul>
      <template
        v-for="(item, key) in breadcrumbs"
        :key="key"
      >
        <li>
          <NuxtLink
            v-if="item.item"
            :to="item.item"
            class="inline !border-none"
          >
            {{ item.name }}
          </NuxtLink>
          <span
            v-else
            class="inline !border-none"
          >
            {{ item.name }}
          </span>
        </li>
      </template>
    </ul>
  </nav>
  <SchemaOrgBreadcrumb
    v-if="breadcrumbs.length > 1"
    :item-list-element="breadcrumbs"
  />
</template>

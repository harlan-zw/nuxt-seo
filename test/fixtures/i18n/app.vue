<script lang="ts" setup>
import { useBreadcrumbItems } from '#imports'

const items = useBreadcrumbItems()
</script>

<template>
  <div>
    <nav>
      <ul>
        <li>
          <NuxtLink to="/">
            Home
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/about">
            About
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <div>
      {{ items }}
    </div>
    <NuxtPage />
  </div>
</template>

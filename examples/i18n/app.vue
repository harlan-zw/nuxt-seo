<script lang="ts" setup>
const { locale, locales, setLocale } = useI18n()
</script>

<template>
  <div>
    <nav>
      <NuxtLink :to="$localePath('/')">
        {{ $t('home') }}
      </NuxtLink>
      |
      <NuxtLink :to="$localePath('/about')">
        {{ $t('about') }}
      </NuxtLink>
      <span style="margin-left: 1rem">
        <button
          v-for="l in (locales as Array<{ code: string, name: string }>)"
          :key="l.code"
          :disabled="l.code === locale"
          @click="setLocale(l.code as any)"
        >
          {{ l.name }}
        </button>
      </span>
    </nav>
    <NuxtPage />
  </div>
</template>

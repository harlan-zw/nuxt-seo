<script setup lang="ts">
import { useAliasGreeting } from '#fixture/app'
import { formatAliasLabel } from '#fixture/app/greeting'
import { useAliasGreeting as useStandaloneGreeting } from '#standalone-fixture/app'

const greeting: string = formatAliasLabel(useAliasGreeting())
const standalone: string = useStandaloneGreeting()
</script>

<template>
  <p>{{ greeting }}</p>
  <p>{{ standalone }}</p>
</template>

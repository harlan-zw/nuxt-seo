<script lang="ts" setup>
import { useNitroOrigin, useSiteConfig, useState } from '#imports'

const siteConfig = useSiteConfig({ debug: true })

const origin = useState()

if (process.server)
  origin.value = useNitroOrigin()

const rows = [
  ...Object.entries(siteConfig)
    .filter(([key]) => key !== '_context')
    .map(([key, value]) => {
      return {
        key,
        value,
        context: siteConfig._context[key],
      }
    }),
  {
    key: 'nitroOrigin',
    value: origin.value,
  },
]
</script>

<template>
  <div>
    <h2 class="text-xl my-10 font-semibold">
      Site Config
    </h2>
    <!--  going to make a table of all the site config values -->
    <UTable :rows="rows" />
    <div class="mt-5">
      <UButton to="/overrides">
        overrides
      </UButton>
    </div>
    <div>
      SiteLink examples
      <SiteLink to="/blog">
        No trailing slash set
      </SiteLink>
      <SiteLink to="/">
        home
      </SiteLink>
    </div>
  </div>
</template>

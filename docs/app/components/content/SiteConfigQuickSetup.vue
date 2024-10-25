<script lang="ts" setup>
const md = `
Setting your site config is important for the modules to work correctly.

::code-group

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  site: {
    url: 'https://example.com',
    name: 'My Awesome Website'
  },
})
\`\`\`

\`\`\`dotenv [.env]
NUXT_PUBLIC_SITE_URL=https://example.com
NUXT_PUBLIC_SITE_NAME=My Awesome Website
\`\`\`
::
`
</script>

<template>
  <div>
    <ModuleLabel slug="site-config" size="sm" class="mb-0 rounded-b-none ">
      Quick Setup
    </ModuleLabel>
    <UCard size="sm" class="relative rounded-tl-none">
      <MDC :value="md" unwrap="p" />
      <template #footer>
        <div class="text-sm text-gray-400">
          For more advanced configurations, check out the <NuxtLink to="/docs/site-config/guides/setting-site-config" class="underline">
            site config guide
          </NuxtLink>.
        </div>
      </template>
    </UCard>
  </div>
</template>

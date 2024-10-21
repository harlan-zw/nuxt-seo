<script setup lang="ts">
// credits: https://github.com/unjs/undocs
import { markdownParser } from '~/composables/markdown'
import { useSyncedPackageManager } from '~/composables/state'

const props = defineProps({
  name: { type: String, required: true },
})

const module = useModule(props.name)

const packageManagers = ref(await Promise.all(
  [
    { name: 'nuxt', command: 'nuxi', install: 'module add', run: 'run ', x: 'npx ' },
    { name: 'npm', command: 'npm', install: 'i', run: 'run ', x: 'npx ' },
    { name: 'yarn', command: 'yarn', install: 'add', run: '', x: 'yarn dlx ' },
    { name: 'pnpm', command: 'pnpm', install: 'i', run: '', x: 'pnpm dlx ' },
    { name: 'bun', command: 'bun', install: 'i', run: 'run ', x: 'bunx ' },
  ].map(async pm => ({
    filename: pm.name,
    code: await markdownParser(`\`${pm.command} ${pm.install} ${pm.name === 'nuxt' ? props.name : module.value.npm}\`{lang="bash"}`),
    key: pm.name,
    lang: 'bash',
  })),
))

const codeGroup = ref()
onMounted(() => {
  if (codeGroup.value) {
    useSyncedPackageManager(packageManagers, toRef(codeGroup.value, 'selectedIndex'))
  }
})

const md = (`
You will need to manually add the module to your Nuxt config.

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
    '${module.value.npm}',
  ],
})
\`\`\`
`)
</script>

<template>
  <div class="mb-12">
    <CodeGroup ref="codeGroup">
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-gray-200 dark:ring-gray-700 mx-[1px]">
        <div class="bg-gray-100 dark:bg-gray-800 ring-gray-300 dark:ring-gray-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 opacity-50 top-3 text-xs font-mono">
            bash
          </div>
          <ProseCode>
            <MDCRenderer v-bind="codeBlock.code" unwrap="p" class="shiki" />
          </ProseCode>
        </div>
        <div v-if="codeBlock.key !== 'nuxt'">
          <MDC :value="md" />
        </div>
      </UCard>
    </CodeGroup>
  </div>
  <SiteConfigQuickSetup />
</template>

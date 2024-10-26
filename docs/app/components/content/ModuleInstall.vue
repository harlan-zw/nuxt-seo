<script setup lang="ts">
// credits: https://github.com/unjs/undocs
import useMarkdownParser from '~/utils/mdc'

const props = defineProps({
  name: { type: String, required: true },
})

const module = useModule(props.name)

const { data: packageManagers } = await useAsyncData(`module-install-${props.name}`, async () => {
  const parse = useMarkdownParser()
  return await Promise.all([
    { name: 'nuxt', command: 'npx nuxi', install: 'module add', run: 'run ', x: 'npx ' },
    { name: 'npm', command: 'npm', install: 'i', run: 'run ', x: 'npx ' },
    { name: 'yarn', command: 'yarn', install: 'add', run: '', x: 'yarn dlx ' },
    { name: 'pnpm', command: 'pnpm', install: 'i', run: '', x: 'pnpm dlx ' },
    { name: 'bun', command: 'bun', install: 'i', run: 'run ', x: 'bunx ' },
  ].map(async pm => ({
    filename: pm.name,
    code: await parse(`\`${pm.command} ${pm.install} ${pm.name === 'nuxt' ? props.name : module.value.npm}\`{lang="bash"}`),
    extraMd: pm.name === 'nuxt'
      ? ''
      : await parse(`
You will need to manually add the module to your Nuxt config.

\`\`\`ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: [
    '${module.value.npm}',
  ],
})
\`\`\`
`),
    key: pm.name,
    lang: 'bash',
  })))
})
</script>

<template>
  <div class="mb-12">
    <CodeGroup>
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-gray-200 dark:ring-gray-700 mx-[1px]">
        <div class="bg-gray-100 dark:bg-gray-800 ring-gray-300 dark:ring-gray-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 opacity-50 top-3 text-xs font-mono">
            bash
          </div>
          <ProseCode>
            <MDCRenderer v-bind="codeBlock.code" unwrap="p" class="shiki" />
          </ProseCode>
        </div>
        <div v-if="codeBlock.extraMd">
          <MDCRenderer v-bind="codeBlock.extraMd" class="shiki" />
        </div>
      </UCard>
    </CodeGroup>
  </div>
  <SiteConfigQuickSetup />
</template>

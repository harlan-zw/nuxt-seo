<script setup lang="ts">
// credits: https://github.com/unjs/undocs
const props = defineProps({
  name: { type: String, required: true },
})

const module = useModule(props.name)

const { data: packageManagers } = await useAsyncData(`module-install-${props.name}`, async () => {
  return await Promise.all([
    { name: 'nuxt', command: 'npx nuxi', install: 'module add', run: 'run ', x: 'npx ' },
    { name: 'npm', command: 'npm', install: 'i', run: 'run ', x: 'npx ' },
    { name: 'yarn', command: 'yarn', install: 'add', run: '', x: 'yarn dlx ' },
    { name: 'pnpm', command: 'pnpm', install: 'i', run: '', x: 'pnpm dlx ' },
    { name: 'bun', command: 'bun', install: 'i', run: 'run ', x: 'bunx ' },
  ].map(async pm => ({
    filename: pm.name,
    code: `<code class="language-bash shiki shiki-themes github-light github-light material-theme-palenight" language="bash"><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #FFCB6B;">${pm.command}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;"> ${pm.install} ${pm.name === 'nuxt' ? props.name : module.value.npm}</span></code>`,
    key: pm.name,
    lang: 'bash',
  })))
})
</script>

<template>
  <div class="mb-12">
    <CodeGroup>
      <UCard v-for="(codeBlock, index) in packageManagers" :key="index" v-bind="codeBlock" class="rounded-t-none ring-gray-200 dark:ring-gray-700 mx-[1px]">
        <div class="mb-7 bg-gray-100 dark:bg-gray-800 ring-gray-300 dark:ring-gray-700 ring rounded py-2 px-4 relative">
          <div class="absolute right-3 opacity-50 top-3 text-xs font-mono">
            bash
          </div>
          <div v-html="codeBlock.code" />
        </div>
        <div v-if="codeBlock.key !== 'nuxt'">
          <p class="mb-3">You will need to manually add the module to your Nuxt config.</p>
          <div class="relative group [&>pre]:rounded-t-none [&>pre]:my-0 my-5">
            <div class="flex items-center gap-1.5 border border-[--ui-color-neutral-200] dark:border-[--ui-color-neutral-700] bg-[--ui-bg] border-b-0 relative rounded-t-[calc(var(--ui-radius)*1.5)] px-4 py-3">
              <span class="iconify i-vscode-icons:file-type-nuxt size-4 shrink-0" aria-hidden="true"></span><span class="text-[--ui-text] text-sm/6">nuxt.config.ts</span>
            </div>
            <pre class="font-mono text-sm/6 border border-[--ui-color-neutral-200] dark:border-[--ui-color-neutral-700] bg-[--ui-color-neutral-50] dark:bg-[--ui-color-neutral-800] rounded-[calc(var(--ui-radius)*1.5)] px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto language-ts shiki shiki-themes github-light github-light material-theme-palenight"><code><span class="line" line="1"><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">export</span><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;"> default</span><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;"> defineNuxtConfig</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">(</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">{
</span></span><span class="line" line="2"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #F07178;">  modules</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">:</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;"> [
</span></span><span class="line" line="3"><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;">    '</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #C3E88D;">nuxt-og-image</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;">'</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">,
</span></span><span class="line" line="4"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">  ]</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">,
</span></span><span class="line" line="5"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">)
</span></span></code></pre>
          </div>
        </div>
      </UCard>
    </CodeGroup>
  </div>
  <SiteConfigQuickSetup />
</template>

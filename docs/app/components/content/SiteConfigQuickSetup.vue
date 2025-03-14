<script lang="ts" setup>
import ProseCode from '@nuxtjs/mdc/runtime/components/prose/ProseCode.vue'

const codeOne
= `export default defineNuxtConfig({
  site: {
    url: 'https://example.com',
    name: 'My Awesome Website'
  },
})`
const codeTwo = `NUXT_SITE_URL=https://example.com
NUXT_SITE_NAME=My Awesome Website`
</script>

<template>
  <div>
    <ModuleLabel slug="site-config" size="sm" class="mb-0 rounded-b-none ">
      Quick Setup
    </ModuleLabel>
    <UCard size="sm" class="relative rounded-tl-none">
      <div>
        <CodeGroup>
          <ProsePre lang="ts" filename="nuxt.config.ts" :code="codeOne">
            <ProseCode class="shiki flex flex-col shiki-themes github-light github-light material-theme-palenight">
              <span class="line" line="1"><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">export</span><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;"> default</span><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;"> defineNuxtConfig</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">(</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;" />
              </span>
              <span class="line" line="2"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #F07178;">  site</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">:</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;"> {
              </span></span>
              <span class="line" line="3"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #F07178; padding-left: 2ch;">     url</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">:</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;"> '</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #C3E88D;">https://example.com</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;">'</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">,
              </span></span>
              <span class="line" line="4"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #F07178; padding-left: 2ch;">     name</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">:</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;"> '</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #C3E88D;">My Awesome Website</span><span style="--shiki-light: #032F62; --shiki-default: #032F62; --shiki-dark: #89DDFF;">'
              </span></span>
              <span class="line" line="5"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">  },
              </span></span>
              <span class="line" line="6"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">)
              </span></span>
            </ProseCode>
          </ProsePre>
          <ProsePre lang="dotenv" filename=".env" :code="codeTwo">
            <ProseCode class="shiki flex flex-col shiki-themes github-light github-light material-theme-palenight">
              <span class="line" line="1"><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">NUXT_SITE_URL</span><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">=</span><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;">https://example.com</span></span>
              <span class="line" line="2"><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">NUXT_SITE_NAME</span><span style="--shiki-light: #D73A49; --shiki-light-font-style: inherit; --shiki-default: #D73A49; --shiki-default-font-style: inherit; --shiki-dark: #89DDFF; --shiki-dark-font-style: italic;">=</span><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;">My Awesome Website</span></span>
            </ProseCode>
          </ProsePre>
        </CodeGroup>
      </div>
      <template #footer>
        <div class="text-sm text-neutral-400">
          For more advanced configurations, check out the <NuxtLink to="/docs/site-config/guides/setting-site-config" class="underline">
            site config guide
          </NuxtLink>.
        </div>
      </template>
    </UCard>
  </div>
</template>

import { defineBuildConfig } from 'obuild/config'

export default defineBuildConfig({
  entries: [
    {
      type: 'bundle',
      input: [
        './src/index.ts',
        './src/content.ts',
        './src/kit.ts',
        './src/devtools.ts',
        './src/i18n.ts',
        './src/pro.ts',
      ],
      rolldown: {
        external: [
          /^nitropack/,
          /^@nuxtjs\/i18n/,
          /^@nuxt\/content/,
          /^@nuxt\/schema/,
          /^@nuxt\/devtools-kit/,
          /^@nuxt\/kit/,
          /^@clack\/prompts/,
          /^nuxt/,
          /^nuxt-site-config/,
          /^vue/,
          /^zod/,
          /^node:/,
          /^consola/,
          /^defu/,
          /^ofetch/,
          /^pathe/,
          /^radix3/,
          /^sirv/,
          /^std-env/,
          /^ufo/,
        ],
      },
    },
    {
      type: 'transform',
      input: './src/runtime/app',
      outDir: './dist/runtime/app',
    },
  ],
})

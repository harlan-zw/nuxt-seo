declare module '#nuxt-seo/setup.mjs' {
  const config: {
    nitroBuilder: 'nitro-v2' | 'nitro-v3'
    installedModuleSlugs: import('nuxtseo-shared/const').NuxtSEOModule['slug'][]
    disabledModuleSlugs: import('nuxtseo-shared/const').NuxtSEOModule['slug'][]
    baseURL: string
    homepagePaths: string[]
    stateDirectory: string
    context: import('nuxtseo-shared/checklist').SetupChecklistContext
  }
  export default config
}

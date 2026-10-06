declare module '#nuxt-seo/setup.mjs' {
  const config: {
    installedModuleSlugs: import('nuxtseo-shared/const').NuxtSEOModule['slug'][]
    disabledModuleSlugs: import('nuxtseo-shared/const').NuxtSEOModule['slug'][]
    baseURL: string
    homepagePaths: string[]
    context: import('nuxtseo-shared/checklist').SetupChecklistContext
  }
  export default config
}

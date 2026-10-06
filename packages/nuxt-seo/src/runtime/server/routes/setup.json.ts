import setup from '#nuxt-seo/setup.mjs'
import { defineEventHandler } from '#nuxtseo/h3'

export default defineEventHandler(() => ({
  installedModuleSlugs: setup.installedModuleSlugs,
  disabledModuleSlugs: setup.disabledModuleSlugs,
  baseURL: setup.baseURL,
  homepagePaths: setup.homepagePaths,
  context: setup.context,
}))

import type {Collections, NavItem} from '@nuxt/content'
import { computedAsync, queryCollectionNavigation, useAsyncData } from '#imports'
import {camelCase, titleCase} from "scule";

export function movingAverage(data: number[], windowSize: number) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1) // Determine the start of the window
    const windowData = data.slice(start, i + 1) // Get the data for the window
    const sum = windowData.reduce((sum, point) => sum + point, 0) // Sum the downloads in the window
    const avg = sum / windowData.length // Calculate the average
    result.push(avg) // Add the moving average to the result
  }
  return result
}

function mapPath(data, node = 0) {
  if (node < 2) {
    return mapPath(data[0].children, node + 1)
  }
  return data.map((item) => {
    if (item.children?.length && !item.page) {
      item.title = titleCase(item.title)
      item.children = mapPath(item.children, node + 1)
    }
    return {
      ...item,
      _path: item.path,
    }
  })
}
function transformAsTopNav(tree: NavItem[]) {
  // we flatten the first children on to the start of the tree
  const children = tree[0]?.children || []
  return [
    ...children.map((child) => {
      if (child.path.endsWith('installation')) {
        child.icon = 'i-ph-rocket-launch-duotone'
      }
      else if (child.path.endsWith('troubleshooting')) {
        child.icon = 'i-ph-hammer-duotone'
      }
      else if (child.path.endsWith('introduction') || child.path.endsWith('what-is-nuxt-seo')) {
        child.icon = 'i-ph-text-align-center-duotone'
      }
      return child
    }),
  ]
}

export async function useDocsNav() {
  const module = useModule()
  if (!module.value) {
    return ref({ top: [], bottom: [] })
  }
  const collection = computed(() => camelCase(module.value.slug) as keyof Collections)
  return computedAsync(async () => {
    const { data: navigation } = await useAsyncData<{ top: NavItem[], bottom: NavItem[] }>(`navigation-${collection.value}`, () => queryCollectionNavigation(collection.value), {
      default: () => [],
      transform(res) {
        const nav = mapPath(res)
        const top = transformAsTopNav((nav || []))
        const bottom = (nav || []).slice(1).map((m) => {
            if (m.path.includes('/api')) {
              m.icon = 'i-logos-nuxt-icon'
              m.title = 'Nuxt API'
            }
            else if (m.path.includes('/nitro-api')) {
              m.icon = 'i-unjs-nitro'
              m.title = 'Nitro API'
            }
            else if (m.path.includes('/releases')) {
              m.icon = 'i-noto-sparkles'
              m.title = 'Releases'
            }
            else if (m.path.includes('/migration-guide')) {
              m.icon = 'i-noto-globe-with-meridians'
              m.title = 'Migration Guides'
            }
            else if (m.path.includes('/guides')) {
              m.icon = 'i-ph-book-duotone'
              m.title = 'Guides'
            }
            if (m.children?.length) {
              m.children = m.children.map((c) => {
                if (c.children?.length === 1) {
                  c = c.children[0]
                }
                return c
              })
              m.children = m.children.map((c) => {
                if (c.path.includes('/api/config')) {
                  c.icon = 'i-vscode-icons-file-type-typescript-official'
                  c.title = 'nuxt.config.ts'
                }
                else if (c.path.includes('/api/schema')) {
                  c.icon = 'i-vscode-icons-file-type-typescript-official'
                  c.title = 'runtime/types.ts'
                }
                else if (c.title.endsWith('()')) {
                  c.mdc = true
                  c.title = `\`${c.title}\`{lang="ts"}`
                }
                else if (c.title.startsWith('<') && c.title.endsWith('>')) {
                  c.mdc = true
                  c.title = `\`${c.title}\`{lang="html"}`
                }
                if (c.children?.length === 1) {
                  c = c.children[0]
                }
                return c
              })
            }
            return m
          })
        return {
          top,
          bottom,
        }
      },
      watch: [collection],
    })
    return navigation
  })
}

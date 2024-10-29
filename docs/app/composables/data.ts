import type { Collections, NavItem } from '@nuxt/content'
import { computedAsync, queryCollectionNavigation, useAsyncData } from '#imports'
import { camelCase, titleCase } from 'scule'

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
    return ref({ files: [], nav: { top: [], bottom: [] } })
  }
  const start = Date.now()
  let searchTiming: number
  let navTiming: number
  const collection = computed(() => camelCase(module.value.slug) as keyof Collections)
  return computedAsync(async () => {
    const [{ data: files }, { data: nav }] = await Promise.all([
      useAsyncData('search', async () => {
        const files = await queryCollectionSearchSections(collection.value)
        searchTiming = Date.now() - start
        return files
      }),
      useAsyncData(`navigation-${collection.value}`, async () => {
        const nav = await queryCollectionNavigation(collection.value)
        navTiming = Date.now() - start
        return nav
      }, {
        default: () => [],
        async transform(res) {
          const nav = mapPath(res)
          const top = transformAsTopNav((nav || []))
          const bottom = await Promise.all((nav || []).slice(1).map(async (m) => {
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
              m.children = await Promise.all(m.children.map(async (c) => {
                if (c.path.includes('/api/config')) {
                  c.icon = 'i-vscode-icons-file-type-typescript-official'
                  c.title = 'nuxt.config.ts'
                }
                else if (c.path.includes('/api/schema')) {
                  c.icon = 'i-vscode-icons-file-type-typescript-official'
                  c.title = 'runtime/types.ts'
                }
                else if (c.title.endsWith('()')) {
                  c.html = true
                  const [fnName] = c.title.split('()')
                  c.title = `<code class="language-ts shiki shiki-themes github-light github-light material-theme-palenight" language="ts"><span style="--shiki-light: #6F42C1; --shiki-default: #6F42C1; --shiki-dark: #82AAFF;">${fnName}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #BABED8;">()</span></code>`
                }
                else if (c.title.startsWith('<') && c.title.endsWith('>')) {
                  const inner = c.title.slice(1, -1)
                  c.html = true
                  c.title = `<code class="language-ts shiki shiki-themes github-light github-light material-theme-palenight" language="ts"><span class="line" line="2"><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;">  &lt;</span><span style="--shiki-light: #22863A; --shiki-default: #22863A; --shiki-dark: #F07178;">${inner}</span><span style="--shiki-light: #24292E; --shiki-default: #24292E; --shiki-dark: #89DDFF;"> /&gt;
</span></span></code>`
                }
                if (c.children?.length === 1) {
                  c = c.children[0]
                }
                return c
              }))
            }
            return m
          }))
          return {
            top,
            bottom,
          }
        },
        watch: [collection],
      }),
    ])
    return { files, nav, searchTiming, navTiming }
  })
}

export const reviews = [
  {
    username: '@nogueiraju',
    img: 'https://pbs.twimg.com/profile_images/1413881210321911810/5j9VNqaN_normal.jpg',
    name: 'Ju Nogueira',
    body: 'Nuxt SEO by @harlan_zw. Makes my life a lot easier.',
  },
  {
    name: 'Estéban',
    body: 'I have to say that your SEO modules are one of the things that make me stay on Nuxt for every one of my websites.',
    img: 'https://avatars.githubusercontent.com/u/45267552?v=4',
    username: '@soubiran_',
  },
  {
    username: '@eoThica',
    name: 'Thomas ✪',
    body: `Just did schema markup for a whole webshop in 20 minutes cause of @harlan_zw. absolutely gorgeous.  Check it out.
nuxtseo.com`,
    img: 'https://pbs.twimg.com/profile_images/1650610309785108484/arOyrwG-_normal.png',
  },
  {
    username: 'marcustoy',
    name: 'marcustoy',
    body: `Hey man, appreciate all your great work on those Nuxt modules. I'm using Nuxt SEO and it's awesome! 💪🏻
`,
    img: 'https://cdn.discordapp.com/avatars/716064643809804288/4895f3e4b7551e9ee03a98f7cd2675fb.webp?size=80',
  },
  {
    username: '@__Sun__',
    name: 'Sun',
    body: `how freaking cool is this ?!

OG Image preview of community templates, as well as the ones i made, right in the @nuxt_js dev tools 🤯

amazing work @harlan_zw`,
    img: 'https://pbs.twimg.com/profile_images/1596204487948894209/SINw8xBj_normal.jpg',
  },
  {
    username: '@Atinux',
    name: 'Sébastien Chopin',
    body: `What an impressive work done by @harlan_zw on Nuxt OG Image v3 🙌`,
    img: 'https://pbs.twimg.com/profile_images/1042510623962275840/1Iw_Mvud_normal.jpg',
  },
  {
    name: 'Fabian B.',
    img: 'https://pbs.twimg.com/profile_images/1715052883899555840/L0TFwzp9_normal.jpg',
    username: '@madebyfabian',
    body: `Nuxt GraphQL middleware by @dulnan is really, really good. And Nuxt SEO by @harlan_zw is also something I use in almost every project. There are so many more though!`,
  },
]

// @vitest-environment nuxt
import { useBreadcrumbItems } from '#imports'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, it, vi } from 'vitest'

const { useRouterMock } = vi.hoisted(() => {
  return {
    useRouterMock: vi.fn().mockImplementation(() => {
      return {
        resolve: vi.fn().mockImplementation((s: string) => {
          if (s === '/') {
            return { matched: [{ name: 'index', title: 'Home' }] }
          }
          return { matched: [{ name: 'unknown' }] }
        }),
        currentRoute: {
          value: {
            path: '/',
          },
        },
      }
    }),
  }
})

mockNuxtImport('useRouter', () => {
  return useRouterMock
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('useBreadcrumbItems', () => {
  it('home', async () => {
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
    [
      {
        "ariaLabel": "Home",
        "current": true,
        "label": "Home",
        "to": "/",
      },
    ]
  `)
  })
  it('subpath', async () => {
    // change the path
    useRouterMock.mockImplementation(() => {
      return {
        currentRoute: {
          value: {
            path: '/subpath',
          },
        },
        resolve(s: string) {
          if (s === '/subpath') {
            return { matched: [{ name: 'subpath', title: 'My subpath' }] }
          }
          return { matched: [{ name: 'index' }] }
        },
      }
    })
    const breadcrumbs = useBreadcrumbItems()
    expect(breadcrumbs.value).toMatchInlineSnapshot(`
      [
        {
          "ariaLabel": "Home",
          "current": false,
          "label": "Home",
          "to": "/",
        },
        {
          "ariaLabel": "Subpath",
          "current": true,
          "label": "Subpath",
          "to": "/subpath",
        },
      ]
    `)
  })
})

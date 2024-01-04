import { withoutTrailingSlash } from 'ufo'
import type { RouteMeta } from 'vue-router'
import type { MaybeRefOrGetter } from 'vue'
import type { BreadcrumbLink } from '@nuxt/ui/dist/runtime/types'
import { pathBreadcrumbSegments } from '../../pure/breadcrumbs'
import {
  computed,
  defineBreadcrumb,
  toValue,
  useI18n,
  useRoute,
  useRouter,
  useSchemaOrg,
  withSiteTrailingSlash,
} from '#imports'

export interface BreadcrumbProps {
  path?: MaybeRefOrGetter<string>
  id?: string
  schemaOrg?: boolean
  /**
   * The Aria Label for the breadcrumbs.
   * You shouldn't need to change this.
   *
   * @default 'Breadcrumbs'
   */
  ariaLabel?: string
  /**
   * Should the current breadcrumb item be shown.
   *
   * @default false
   */
  hideCurrent?: MaybeRefOrGetter<boolean>
  /**
   * Should the root breadcrumb be shown.
   */
  hideRoot?: MaybeRefOrGetter<boolean>
}

export interface BreadcrumbItemProps extends BreadcrumbLink {
  /** Whether the breadcrumb item represents the aria-current. */
  current?: boolean
  /**
   * The type of current location the breadcrumb item represents, if `isCurrent` is true.
   * @default 'page'
   */
  ariaCurrent?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean | 'true' | 'false'
  /** Whether the breadcrumb item is disabled. */
  disabled?: boolean
  to: string
  ariaLabel?: string
  separator?: boolean | string
  icon?: string
  class?: (string | string[] | undefined)[] | string
  /**
   * @internal
   */
  _props?: {
    first: boolean
    last: boolean
  }
}

function withoutQuery(path: string) {
  return path.split('?')[0]
}

function titleCase(s: string) {
  return s
    .replaceAll('-', ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

export function useBreadcrumbItems(options: BreadcrumbProps = {}) {
  const router = useRouter()
  const routes = router.getRoutes()

  const i18n = useI18n()
  const items = computed(() => {
    let rootNode = '/'
    if (i18n) {
      if (i18n.strategy === 'prefix' || (i18n.strategy !== 'no_prefix' && i18n.defaultLocale.value !== i18n.locale.value))
        rootNode = `/${i18n.defaultLocale.value}`
    }
    const current = withoutQuery(withoutTrailingSlash(toValue(options.path || useRoute().path) || rootNode))
    return pathBreadcrumbSegments(current, rootNode)
      .map(path => ({
        to: path,
      }) as BreadcrumbItemProps)
      .map((item) => {
        const route = routes.find(r => withoutTrailingSlash(r.path) === withoutTrailingSlash(item.to))
        const routeMeta = (route?.meta || {}) as RouteMeta & { title?: string, breadcrumbLabel: string }
        const routeName = route ? String(route.name || route.path) : (item.to === '/' ? 'index' : 'unknown')
        let [name] = routeName.split('___')
        if (name === 'unknown')
          name = item.to.split('/').pop() || '' // fallback to last path segment
        // merge with the route meta
        if (routeMeta.breadcrumb) {
          item = {
            ...item,
            ...routeMeta.breadcrumb,
          }
        }
        // allow opt-out of label normalise with `false` value
        // @ts-expect-error untyped
        item.label = item.label || routeMeta.breadcrumbTitle || routeMeta.title
        if (typeof item.label === 'undefined') {
          // try use i18n
          // fetch from i18n
          // @ts-expect-error untyped
          item.label = item.label || i18n.t(`breadcrumb.items.${name}.label`, name === 'index' ? 'Home' : titleCase(name), { missingWarn: false })
          // @ts-expect-error untyped
          item.ariaLabel = item.ariaLabel || i18n.t(`breadcrumb.items.${name}.ariaLabel`, item.label, { missingWarn: false })
        }
        item.ariaLabel = item.ariaLabel || item.label
        // mark the current based on the options
        item.current = item.current || item.to === current
        if (toValue(options.hideCurrent) && item.current)
          return false
        return item
      })
      .map((m) => {
        if (m && m.to) {
          m.to = withSiteTrailingSlash(m.to).value
          if (m.to === rootNode && toValue(options.hideRoot))
            return false
        }
        return m
      })
      .filter(Boolean) as BreadcrumbItemProps[]
  })

  if (process.server && options.schemaOrg) {
    useSchemaOrg([
      defineBreadcrumb(computed(() => {
        return {
          id: `#${options.id || 'breadcrumb'}`,
          itemListElement: items.value.map(item => ({
            name: item.label || item.ariaLabel,
            item: item.to,
          })),
        }
      })),
    ])
  }
  return items
}

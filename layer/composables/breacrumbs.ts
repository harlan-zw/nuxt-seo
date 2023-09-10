import type { ParsedURL } from 'ufo'
import { hasTrailingSlash, parseURL, stringifyParsedURL, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import type { RouteRecord } from 'vue-router'
import { computed, useRouter, createInternalLinkResolver, titleCase } from '#imports'

function getBreadcrumbs(input: string) {
  const startNode = parseURL(input)
  const appendsTrailingSlash = hasTrailingSlash(startNode.pathname)

  const stepNode = (node: ParsedURL, nodes: string[] = []) => {
    const fullPath = stringifyParsedURL(node)
    // the pathname will always be without the trailing slash
    const currentPathName = node.pathname
    // when we hit the root the path will be an empty string; we swap it out for a slash
    nodes.push(fullPath || '/')
    // strip the last path segment (/my/cool/path -> /my/cool)
    node.pathname = currentPathName.substring(0, currentPathName.lastIndexOf('/'))
    // if the input was provided with a trailing slash we need to honour that
    if (appendsTrailingSlash)
      node.pathname = withTrailingSlash(node.pathname.substring(0, node.pathname.lastIndexOf('/')))

    // if we still have a pathname, and it's different, traverse
    if (node.pathname !== currentPathName)
      stepNode(node, nodes)
    return nodes
  }
  return stepNode(startNode)
}

export function useBreadcrumbs() {
  const router = useRouter()
  const resolveUrlAbs = createInternalLinkResolver(true)
  const resolveUrl = createInternalLinkResolver()

  return computed(() => {
    const routes = router.getRoutes()
    const route = router.currentRoute.value
    return getBreadcrumbs(route.path)
      .reverse()
      .map(path => ({
        path,
        meta: routes.find((route: RouteRecord) => withoutTrailingSlash(route.path) === withoutTrailingSlash(path))?.meta,
      }))
      .map(({ path, meta }) => {
        // title case string regex
        let title = meta?.breadcrumbTitle || meta?.title
        if (!title) {
          if (path === '/')
            title = 'Home'
          else
          // pop last url segment and title case it
            title = titleCase(withoutTrailingSlash(path).split('/').pop() || '')
        }
        return {
          schema: {
            name: title,
            item: resolveUrlAbs(path),
          },
          to: resolveUrl(path),
          title,
        }
      })
  })
}

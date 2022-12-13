import type { ParsedURL } from 'ufo'
import { hasTrailingSlash, parseURL, stringifyParsedURL, withTrailingSlash } from 'ufo'
import { useRoute } from '#imports'

const getBreadcrumbs = (input: string) => {
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
  return computed(() => {
    const route = useRoute()
    const routes = useRouter().getRoutes()
    const links = getBreadcrumbs(route.path)
    return links
        .reverse()
        .map(path => ({
          path,
          meta: routes.find(route => route.path === path)?.meta
        }))
        .filter(({ meta }) => Boolean(meta))
        .map(({ path, meta }) => {
          return {
            name: meta.breadcrumbTitle || meta.title || path,
            item: path === route.path ? '' : path,
          }
        })
  })
}

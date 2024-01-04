import { hasTrailingSlash, parseURL, stringifyParsedURL, withTrailingSlash } from 'ufo'

export function pathBreadcrumbSegments(path: string, rootNode: string = '/'): string[] {
  const startNode = parseURL(path)
  const appendsTrailingSlash = hasTrailingSlash(startNode.pathname)

  const stepNode = (node: ReturnType<typeof parseURL>, nodes: string[] = []) => {
    const fullPath = stringifyParsedURL(node)
    // the pathname will always be without the trailing slash
    const currentPathName = node.pathname || '/'
    // when we hit the root the path will be an empty string; we swap it out for a slash
    nodes.push(fullPath || '/')
    if (currentPathName !== rootNode && currentPathName !== '/') {
      // strip the last path segment (/my/cool/path -> /my/cool)
      node.pathname = currentPathName.substring(0, currentPathName.lastIndexOf('/'))
      // if the input was provided with a trailing slash we need to honour that
      if (appendsTrailingSlash)
        node.pathname = withTrailingSlash(node.pathname.substring(0, node.pathname.lastIndexOf('/')))
      stepNode(node, nodes)
    }
    return nodes
  }
  return stepNode(startNode)
    .reverse()
}

export default defineNuxtPlugin(() => {
  const inIframe = window.parent !== window

  // When served from the dev server directly (not in iframe), auto-connect to same origin
  if (!inIframe && !standaloneUrl.value) {
    standaloneUrl.value = window.location.origin
  }

  useDevtoolsConnection({
    onConnected(client) {
      const props = client.host?.nuxt?.vueApp?.config?.globalProperties
      base.value = props?.$router?.options?.history?.base || client.host?.app?.baseURL || '/'
      const $route = props?.$route
      if ($route) {
        path.value = $route.path || '/'
        query.value = $route.query
      }
      refreshSources()
    },
    onRouteChange(route) {
      path.value = route.path
      query.value = route.query
      refreshSources()
    },
  })
})

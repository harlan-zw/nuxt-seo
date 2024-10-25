import { modules } from '../../../src/const'

export function useModule(_slug?: Ref<string>) {
  const stats = inject('stats', ref({ modules: [] }))
  const route = useRoute()
  return computed(() => {
    const slug = _slug ? toValue(_slug) : route.path.split('/')[2]
    return {
      ...(stats.value?.modules.find(m => m.slug === slug) || {}),
      ...(modules.find(m => m.slug === slug) || {}),
    }
  })
}

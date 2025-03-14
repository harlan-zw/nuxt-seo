import { modules } from '../../../src/const'

export function useModule(moduleStats: any[], _slug?: Ref<string>) {
  const route = useRoute()
  return computed(() => {
    const slug = _slug ? toValue(_slug) : route.path.split('/')[2]
    return {
      ...(moduleStats.find(m => m.slug === slug) || {}),
      ...(modules.find(m => m.slug === slug) || {}),
    }
  })
}

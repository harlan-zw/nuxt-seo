import { modules } from '../../../src/const'

export function useModule(_slug?: Ref<string>) {
  const stats = inject('stats')
  const route = useRoute()
  const slug = computed(() => {
    return _slug?.value || route.path.split('/')[2]
  })
  return computed(() => {
    const _slug = slug.value
    return {
      ...(stats.value?.modules.find(m => m.slug === _slug) || {}),
      ...(modules.find(m => m.slug === _slug) || {}),
    }
  })
}

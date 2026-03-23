import { useClipboard } from '@vueuse/core'

export function useCopy(timeout = 2000): { copy: (text: string) => Promise<void>, copied: import('vue').Ref<boolean> } {
  const { copy, copied } = useClipboard({ legacy: true, copiedDuring: timeout })
  return { copy, copied }
}

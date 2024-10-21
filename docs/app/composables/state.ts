export function useSyncedPackageManager(codeBlocks: Ref<{ filename: string }[]>, syncRef: Ref<number>) {
  const indexToName = (index: number) => codeBlocks.value[index]?.filename
  const nameToIndex = (name: string) => codeBlocks.value.findIndex((pm) => pm.filename === name)

  const packageManager = useState<string>('package-manager', () => localStorage.getItem('package-manager') as string)

  watch(
    packageManager,
    (name) => {
      const index = nameToIndex(name)
      if (index !== -1) {
        syncRef.value = nameToIndex(name)
      }
    },
    { immediate: true },
  )

  watch(syncRef, (index) => {
    const name = indexToName(index)
    if (name) {
      packageManager.value = name
      localStorage.setItem('package-manager', name)
    }
  })
}

export function appStorage() {
  // if we have the binding
  if (process.env.KV || globalThis.__env__?.KV || globalThis.KV) {
    return hubKV()
  }
  // stub for unstorage if needed
  return useStorage()
}

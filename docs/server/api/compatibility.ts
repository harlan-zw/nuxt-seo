export default defineEventHandler((e) => {
  return {
    ASSETS: !!e?.context?.cloudflare?.env.ASSETS,
  }
})

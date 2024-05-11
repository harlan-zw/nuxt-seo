export default defineNuxtPlugin(() => {
  const adBlocked = ref(false)

  const adsBlocked = async () => {
    return await $fetch('https://cdn.carbonads.com/carbon.js?serve=CWYD553E&placement=nuxtcom', {
      method: 'HEAD',
      mode: 'no-cors',
    })
      .then(() => false)
      .catch(() => true)
  }

  onNuxtReady(async () => {
    if (await adsBlocked())
      adBlocked.value = true
  })

  return {
    provide: {
      ads: {
        adBlocked,
      },
    },
  }
})

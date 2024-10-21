function formatDate(date) {
  return date.toISOString().split('T')[0]
}

export default defineCachedEventHandler(async (e) => {
  const packageName = (getRouterParam(e, 'pkgName') || '').replace('_', '/')
  if (!packageName?.startsWith('@nuxt') && !packageName?.startsWith('nuxt-')) {
    throw new Error(`Invalid package ${packageName}`)
  }
  const endDate = new Date() // Today's date
  endDate.setDate(endDate.getDate() - 2) // 90 days ago
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - 90) // 90 days ago
  const startDate30 = new Date()
  startDate30.setDate(endDate.getDate() - 30) // 30 days ago
  const formattedStartDate = formatDate(startDate)
  const formattedEndDate = formatDate(endDate)

  const data = await $fetch<{
    start: string
    end: string
    package: string
    downloads: { downloads: number, day: string }[]
  }>(`https://api.npmjs.org/downloads/range/${formattedStartDate}:${formattedEndDate}/${packageName}`)

  const totalDownloads90 = data.downloads.reduce((sum, day) => sum + day.downloads, 0)
  const totalDownloads30 = data.downloads
    .filter(day => new Date(day.day) >= startDate30)
    .reduce((sum, day) => sum + day.downloads, 0)
  const averageDownloads90 = Math.round(totalDownloads90 / 90)
  const averageDownloads30 = Math.round(totalDownloads30 / 30)

  const percentageChange = Math.round(((averageDownloads30 - averageDownloads90) / averageDownloads90) * 100)
  return {
    downloads: data.downloads,
    totalDownloads90,
    totalDownloads30,
    averageDownloads30,
    averageDownloads90,
    percentageChange,
  }
}, {
  // 1 day
  maxAge: 60 * 60 * 24,
})

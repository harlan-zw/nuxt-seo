
export function serverQueryContent() {
  const db = queryCollection('docs')
  return {
    find() {
      return db.all()
    },
  }
}

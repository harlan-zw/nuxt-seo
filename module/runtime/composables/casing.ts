export function titleCase(s: string) {
  s = s.replaceAll('-', ' ')
  // title case each word in s
  return s.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())
}

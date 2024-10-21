export function humanNumber(s: string | number) {
  return Number(s).toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })
}

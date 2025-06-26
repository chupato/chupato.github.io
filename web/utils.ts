export const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

export function rtfFormat(diffMs: number): string {
  const sec = Math.round(diffMs / 1000)
  if (Math.abs(sec) < 60) return rtf.format(-sec, 'second')
  const min = Math.round(sec / 60)
  if (Math.abs(min) < 60) return rtf.format(-min, 'minute')
  const hr = Math.round(min / 60)
  if (Math.abs(hr) < 24) return rtf.format(-hr, 'hour')
  const day = Math.round(hr / 24)
  return rtf.format(-day, 'day')
}

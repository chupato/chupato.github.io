const dfmt = new Intl.DurationFormat(undefined, {
  style: 'narrow',
})

export function rtfFormat(diffMs: number): string {
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const seconds = totalSeconds % 60
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (!totalMinutes) return dfmt.format({ seconds })
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  const hours = totalHours % 24
  if (!totalHours) return dfmt.format({ minutes, seconds })
  const days = Math.floor(totalHours / 24)
  return dfmt.format(days ? { days, hours } : { hours, minutes })
}

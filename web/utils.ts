const pad = (n: number) => n < 10 ? `0${n}` : n

export function rtfFormat(diffMs: number): string {
  const totalSeconds = Math.floor(Math.abs(diffMs) / 1000)
  const seconds = pad(totalSeconds % 60)
  const totalMinutes = Math.floor(totalSeconds / 60)
  if (!totalMinutes) return `${seconds}s`
  const minutes = totalMinutes % 60
  const totalHours = Math.floor(totalMinutes / 60)
  if (!totalHours) return `${minutes}m${seconds}s`
  const hours = totalHours % 24
  const days = Math.floor(totalHours / 24)
  return days ? `${days}d${pad(hours)}` : `${hours}h${pad(minutes)}m`
}

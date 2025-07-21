function formatDuration2(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  if (minutes === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`

  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`
}

export default formatDuration2
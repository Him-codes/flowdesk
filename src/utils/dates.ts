const DAY_MS = 86_400_000

const pad = (n: number) => String(n).padStart(2, '0')

/** Local calendar date as `YYYY-MM-DD` (what <input type="date"> uses). */
export const toDateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function isValidDateKey(key: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(key) && toDateKey(parseDateKey(key)) === key
}

/** The date key `days` days from `from` (negative for the past). */
export function dateKeyOffset(days: number, from: number = Date.now()): string {
  const date = new Date(from)
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

/** Whole calendar days from `fromKey` to `toKey` (positive when `toKey` is later). */
export const daysBetween = (fromKey: string, toKey: string) =>
  Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / DAY_MS)

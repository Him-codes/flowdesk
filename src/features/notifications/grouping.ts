import type { AppNotification } from '../../types'

/** Splits notifications into "today" (since local midnight) and "earlier", newest first. */
export function groupByDay(items: AppNotification[], now = Date.now()) {
  const midnight = new Date(now)
  midnight.setHours(0, 0, 0, 0)
  const start = midnight.getTime()
  const sorted = [...items].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
  return {
    today: sorted.filter((n) => Date.parse(n.timestamp) >= start),
    earlier: sorted.filter((n) => Date.parse(n.timestamp) < start),
  }
}

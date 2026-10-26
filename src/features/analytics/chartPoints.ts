import type { ChartPoint } from '../../components/charts'
import type { BucketPoint } from '../../types'
import { formatDate, formatFullDate, formatMonth, formatShortDate } from '../../utils/format'

/** Turns API buckets into chart points with axis labels and descriptive tooltips (1-day, 3-day and 30-day buckets). */
export function toChartPoints(points: BucketPoint[], bucketDays: number): ChartPoint[] {
  return points.map((p) => {
    if (bucketDays === 1) return { label: formatShortDate(p.date), detail: formatFullDate(p.date), value: p.value }
    if (bucketDays >= 30) return { label: formatMonth(p.date), detail: `${bucketDays} days ending ${formatDate(p.date)}`, value: p.value }
    const end = new Date(p.date)
    const start = new Date(end)
    start.setDate(start.getDate() - (bucketDays - 1))
    return { label: formatShortDate(p.date), detail: `${formatShortDate(start)} – ${formatDate(end)}`, value: p.value }
  })
}

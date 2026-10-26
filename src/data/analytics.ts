import type { AnalyticsSeries, BucketPoint, CategoryBreakdown, ConversionAnalytics, CustomerGrowth, Kpi, RangeKey, RevenueAnalytics, RevenueSeries } from '../types'
import { DAY_MS, NOW, START_OF_TODAY, daysAgoIndex } from './clock'
import { countJoinedBy, customers } from './customers'
import { createRng } from './prng'
import { HISTORY_DAYS, transactions } from './transactions'

/** Illustrative revenue categories. A transaction's category is derived from its ID, so it never changes. */
export const CATEGORIES = [
  { name: 'Subscriptions', weight: 45 },
  { name: 'Consulting', weight: 20 },
  { name: 'Implementation', weight: 15 },
  { name: 'Add-ons', weight: 12 },
  { name: 'Support plans', weight: 8 },
]

export function categoryOf(transactionId: string): string {
  let roll = (Math.imul(Number(transactionId.slice(4)), 2654435761) >>> 8) % 100
  for (const category of CATEGORIES) {
    if (roll < category.weight) return category.name
    roll -= category.weight
  }
  return CATEGORIES[0].name
}

// Daily aggregates indexed by "days ago" (0 = today).
const revenueByDay = new Array<number>(HISTORY_DAYS).fill(0)
const attemptsByDay = new Array<number>(HISTORY_DAYS).fill(0)
const completedByDay = new Array<number>(HISTORY_DAYS).fill(0)
const visitsByDay = new Array<number>(HISTORY_DAYS).fill(0)
const failedByDay = new Array<number>(HISTORY_DAYS).fill(0)
const categoryRevenueByDay: Record<string, number[]> = Object.fromEntries(CATEGORIES.map((c) => [c.name, new Array<number>(HISTORY_DAYS).fill(0)]))

for (const t of transactions) {
  const d = daysAgoIndex(Date.parse(t.date))
  if (d < 0 || d >= HISTORY_DAYS) continue
  attemptsByDay[d] += 1
  if (t.status === 'Failed') failedByDay[d] += 1
  if (t.status === 'Completed') {
    completedByDay[d] += 1
    revenueByDay[d] += t.amount
    categoryRevenueByDay[categoryOf(t.id)][d] += t.amount
  }
}

const visitRng = createRng(77)
for (let d = 0; d < HISTORY_DAYS; d++) {
  const weekday = new Date(START_OF_TODAY - d * DAY_MS).getDay()
  const weekendFactor = weekday === 0 ? 0.55 : weekday === 6 ? 0.7 : 1
  const base = 80 + 60 * (1 - d / (HISTORY_DAYS - 1))
  visitsByDay[d] = Math.round(base * weekendFactor * (0.88 + 0.24 * visitRng()))
}

const sum = (values: number[], fromDay: number, toDay: number) => {
  let total = 0
  for (let d = fromDay; d <= toDay; d++) total += values[d]
  return total
}
const pctChange = (current: number, previous: number) => (previous === 0 ? 0 : ((current - previous) / previous) * 100)
const lastDays = (values: number[], n: number) => Array.from({ length: n }, (_, k) => values[n - 1 - k])
const rate = (completed: number, visits: number) => (visits === 0 ? 0 : (completed / visits) * 100)

const WINDOW = 30

export function computeKpis(): Kpi[] {
  const revenue = sum(revenueByDay, 0, WINDOW - 1)
  const revenuePrev = sum(revenueByDay, WINDOW, 2 * WINDOW - 1)
  const attempts = sum(attemptsByDay, 0, WINDOW - 1)
  const attemptsPrev = sum(attemptsByDay, WINDOW, 2 * WINDOW - 1)
  const conversion = rate(sum(completedByDay, 0, WINDOW - 1), sum(visitsByDay, 0, WINDOW - 1))
  const conversionPrev = rate(sum(completedByDay, WINDOW, 2 * WINDOW - 1), sum(visitsByDay, WINDOW, 2 * WINDOW - 1))
  const customerTotal = customers.length
  const customerPrev = countJoinedBy(NOW - WINDOW * DAY_MS)

  const customerTrend = Array.from({ length: WINDOW }, (_, k) =>
    countJoinedBy(START_OF_TODAY + DAY_MS - (WINDOW - 1 - k) * DAY_MS),
  )
  const conversionTrend = Array.from({ length: WINDOW }, (_, k) => {
    const d = WINDOW - 1 - k
    return rate(completedByDay[d], visitsByDay[d])
  })

  const comparison = 'vs last month'
  return [
    { id: 'revenue', label: 'Total Revenue', value: revenue, format: 'currency', changePct: pctChange(revenue, revenuePrev), comparison, trend: lastDays(revenueByDay, WINDOW) },
    { id: 'customers', label: 'Customers', value: customerTotal, format: 'number', changePct: pctChange(customerTotal, customerPrev), comparison, trend: customerTrend },
    { id: 'transactions', label: 'Transactions', value: attempts, format: 'number', changePct: pctChange(attempts, attemptsPrev), comparison, trend: lastDays(attemptsByDay, WINDOW) },
    { id: 'conversion', label: 'Conversion Rate', value: conversion, format: 'percent', changePct: pctChange(conversion, conversionPrev), comparison, trend: conversionTrend },
  ]
}

const RANGE_DAYS: Record<RangeKey, number> = { '7d': 7, '30d': 30, '90d': 90, '12m': 360 }

/** Daily points for 7d/30d/90d; twelve rolling 30-day buckets for 12m. Compared with the preceding period of equal length. */
export function computeRevenueSeries(range: RangeKey): RevenueSeries {
  const days = RANGE_DAYS[range]
  const dateOf = (daysAgo: number) => new Date(START_OF_TODAY - daysAgo * DAY_MS).toISOString()

  const points =
    range === '12m'
      ? Array.from({ length: 12 }, (_, b) => {
          const newestDay = (11 - b) * 30
          return { date: dateOf(newestDay), value: sum(revenueByDay, newestDay, newestDay + 29) }
        })
      : Array.from({ length: days }, (_, k) => ({ date: dateOf(days - 1 - k), value: revenueByDay[days - 1 - k] }))

  const total = sum(revenueByDay, 0, days - 1)
  const previousTotal = sum(revenueByDay, days, 2 * days - 1)
  return { range, points, total, previousTotal, changePct: pctChange(total, previousTotal) }
}

// ---------------------------------------------------------------------------------------------
// Analytics page. Series are bucketed so no chart has more than 30 points, and each series carries
// the preceding period of equal length for comparison.
// ---------------------------------------------------------------------------------------------

const BUCKET_DAYS: Record<RangeKey, number> = { '7d': 1, '30d': 1, '90d': 3, '12m': 30 }

const isoDaysAgo = (daysAgo: number) => new Date(START_OF_TODAY - daysAgo * DAY_MS).toISOString()
/** Timestamp at the end of the day `daysAgo` days back. */
const endOfDay = (daysAgo: number) => START_OF_TODAY + DAY_MS - daysAgo * DAY_MS

/** `valueOf(newestDay, oldestDay)` aggregates the days in a bucket (inclusive, as "days ago" indexes). */
function bucketed(range: RangeKey, valueOf: (newestDay: number, oldestDay: number) => number): AnalyticsSeries {
  const days = RANGE_DAYS[range]
  const bucketDays = BUCKET_DAYS[range]
  const count = days / bucketDays
  const points: BucketPoint[] = []
  const previous: number[] = []
  for (let k = 0; k < count; k++) {
    const newest = (count - 1 - k) * bucketDays
    const oldest = newest + bucketDays - 1
    points.push({ date: isoDaysAgo(newest), value: valueOf(newest, oldest) })
    previous.push(valueOf(newest + days, oldest + days))
  }
  return { range, bucketDays, points, previous }
}

export function computeRevenueAnalytics(range: RangeKey): RevenueAnalytics {
  const days = RANGE_DAYS[range]
  const series = bucketed(range, (a, b) => sum(revenueByDay, a, b))
  const total = sum(revenueByDay, 0, days - 1)
  const previousTotal = sum(revenueByDay, days, 2 * days - 1)
  return { ...series, total, previousTotal, changePct: pctChange(total, previousTotal) }
}

const joinedBetween = (newestDay: number, oldestDay: number) => countJoinedBy(endOfDay(newestDay)) - countJoinedBy(endOfDay(oldestDay + 1))

export function computeCustomerGrowth(range: RangeKey): CustomerGrowth {
  const days = RANGE_DAYS[range]
  const series = bucketed(range, joinedBetween)
  const newCustomers = joinedBetween(0, days - 1)
  const previousNew = joinedBetween(days, 2 * days - 1)
  return { ...series, newCustomers, previousNew, changePct: pctChange(newCustomers, previousNew), totalCustomers: customers.length }
}

export function computeConversionAnalytics(range: RangeKey): ConversionAnalytics {
  const days = RANGE_DAYS[range]
  const series = bucketed(range, (a, b) => rate(sum(completedByDay, a, b), sum(visitsByDay, a, b)))
  const visits = sum(visitsByDay, 0, days - 1)
  const completed = sum(completedByDay, 0, days - 1)
  const current = rate(completed, visits)
  const previousRate = rate(sum(completedByDay, days, 2 * days - 1), sum(visitsByDay, days, 2 * days - 1))
  return { ...series, rate: current, previousRate, changePct: pctChange(current, previousRate), visits, completed, failed: sum(failedByDay, 0, days - 1) }
}

export function computeCategoryBreakdown(range: RangeKey): CategoryBreakdown {
  const days = RANGE_DAYS[range]
  const rows = CATEGORIES.map((c) => ({
    category: c.name,
    revenue: sum(categoryRevenueByDay[c.name], 0, days - 1),
    previousRevenue: sum(categoryRevenueByDay[c.name], days, 2 * days - 1),
  }))
  const total = rows.reduce((t, r) => t + r.revenue, 0)
  const previousTotal = rows.reduce((t, r) => t + r.previousRevenue, 0)
  const slices = rows
    .map((r) => ({ ...r, share: total === 0 ? 0 : r.revenue / total, changePct: pctChange(r.revenue, r.previousRevenue) }))
    .sort((a, b) => b.revenue - a.revenue)
  return { range, total, previousTotal, slices }
}

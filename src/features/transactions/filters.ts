import type { Transaction, TransactionStatus } from '../../types'
import { sortOption } from '../../utils/table'

export type DateFilter = 'all' | 'today' | '7d' | '30d' | '90d'
export type AmountFilter = 'all' | 'lt100' | '100-500' | '500-1000' | 'gt1000'
export type TransactionStatusFilter = 'all' | TransactionStatus

export interface TransactionFilters {
  query: string
  date: DateFilter
  status: TransactionStatusFilter
  amount: AmountFilter
}

export const DEFAULT_TRANSACTION_FILTERS: TransactionFilters = { query: '', date: 'all', status: 'all', amount: 'all' }

export const DATE_OPTIONS = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
]

export const AMOUNT_OPTIONS = [
  { value: 'all', label: 'Any amount' },
  { value: 'lt100', label: 'Under $100' },
  { value: '100-500', label: '$100 – $500' },
  { value: '500-1000', label: '$500 – $1,000' },
  { value: 'gt1000', label: 'Over $1,000' },
]

export const TRANSACTION_SORT_OPTIONS = [
  sortOption('date', 'desc', 'Date (newest)'),
  sortOption('date', 'asc', 'Date (oldest)'),
  sortOption('amount', 'desc', 'Amount (high to low)'),
  sortOption('amount', 'asc', 'Amount (low to high)'),
  sortOption('customer', 'asc', 'Customer (A–Z)'),
  sortOption('customer', 'desc', 'Customer (Z–A)'),
  sortOption('status', 'asc', 'Status (A–Z)'),
  sortOption('status', 'desc', 'Status (Z–A)'),
]

export const TRANSACTION_SORT_ACCESSORS: Record<string, (t: Transaction) => string | number> = {
  date: (t) => Date.parse(t.date),
  amount: (t) => t.amount,
  customer: (t) => t.customerName,
  status: (t) => t.status,
}

const DAY_MS = 86_400_000
const WINDOW_DAYS: Record<Exclude<DateFilter, 'all' | 'today'>, number> = { '7d': 7, '30d': 30, '90d': 90 }
/** Half-open ranges [min, max). */
const AMOUNT_RANGES: Record<Exclude<AmountFilter, 'all'>, [number, number]> = {
  lt100: [0, 100],
  '100-500': [100, 500],
  '500-1000': [500, 1000],
  gt1000: [1000, Infinity],
}

export function filterTransactions(rows: Transaction[], filters: TransactionFilters, now = Date.now()): Transaction[] {
  const query = filters.query.trim().toLowerCase()
  const numericQuery = query.replace(/[$,]/g, '')

  let since = -Infinity
  if (filters.date === 'today') {
    const midnight = new Date(now)
    midnight.setHours(0, 0, 0, 0)
    since = midnight.getTime()
  } else if (filters.date !== 'all') {
    since = now - WINDOW_DAYS[filters.date] * DAY_MS
  }
  const range = filters.amount === 'all' ? null : AMOUNT_RANGES[filters.amount]

  return rows.filter((t) => {
    if (filters.status !== 'all' && t.status !== filters.status) return false
    if (range && (t.amount < range[0] || t.amount >= range[1])) return false
    if (since !== -Infinity && Date.parse(t.date) < since) return false
    if (!query) return true
    return (
      t.id.toLowerCase().includes(query) ||
      t.customerName.toLowerCase().includes(query) ||
      t.method.toLowerCase().includes(query) ||
      t.amount.toFixed(2).includes(numericQuery)
    )
  })
}

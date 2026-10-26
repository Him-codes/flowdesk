import type { CustomerStatus, CustomerSummary } from '../../types'
import { sortOption } from '../../utils/table'

export type CustomerStatusFilter = 'all' | CustomerStatus

export interface CustomerFilters {
  query: string
  status: CustomerStatusFilter
}

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = { query: '', status: 'all' }

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'New', label: 'New' },
]

/** One option per direction for every sortable column, so header sorting and the Sort control always agree. */
export const CUSTOMER_SORT_OPTIONS = [
  sortOption('lastActivity', 'desc', 'Last activity (newest)'),
  sortOption('lastActivity', 'asc', 'Last activity (oldest)'),
  sortOption('name', 'asc', 'Name (A–Z)'),
  sortOption('name', 'desc', 'Name (Z–A)'),
  sortOption('company', 'asc', 'Company (A–Z)'),
  sortOption('company', 'desc', 'Company (Z–A)'),
  sortOption('totalSpent', 'desc', 'Total spent (high to low)'),
  sortOption('totalSpent', 'asc', 'Total spent (low to high)'),
]

export const CUSTOMER_SORT_ACCESSORS: Record<string, (customer: CustomerSummary) => string | number> = {
  name: (c) => c.name,
  company: (c) => c.company,
  totalSpent: (c) => c.totalSpent,
  lastActivity: (c) => Date.parse(c.lastActivity),
}

export function filterCustomers(rows: CustomerSummary[], filters: CustomerFilters): CustomerSummary[] {
  const query = filters.query.trim().toLowerCase()
  return rows.filter(
    (c) =>
      (filters.status === 'all' || c.status === filters.status) &&
      (!query || [c.name, c.email, c.company].some((value) => value.toLowerCase().includes(query))),
  )
}

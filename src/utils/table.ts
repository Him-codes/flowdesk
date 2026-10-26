import type { SortState } from '../types'

export interface SortOption extends SortState {
  /** `${key}:${direction}`, usable as a <select> value. */
  value: string
  label: string
}

export const sortOption = (key: string, direction: SortState['direction'], label: string): SortOption => ({
  key,
  direction,
  label,
  value: `${key}:${direction}`,
})

export const sortValue = (sort: SortState) => `${sort.key}:${sort.direction}`

/** Stable sort by the accessor registered for `sort.key`. Numbers compare numerically, strings by locale. */
export function sortRows<T>(rows: T[], sort: SortState, accessors: Record<string, (row: T) => string | number>): T[] {
  const get = accessors[sort.key]
  if (!get) return rows
  const direction = sort.direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => {
    const x = get(a)
    const y = get(b)
    const result = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { sensitivity: 'base' })
    return result * direction
  })
}

export const pageCountFor = (total: number, pageSize: number) => Math.max(1, Math.ceil(total / pageSize))

export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  return rows.slice((page - 1) * pageSize, page * pageSize)
}

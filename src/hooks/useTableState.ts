import { useCallback, useState } from 'react'
import type { SortState } from '../types'

/**
 * Filter + sort + page state for a list. Any filter or sort change returns to page 1.
 * `initialFilters` must be a stable reference (define it at module level).
 */
export function useTableState<F extends object>(initialFilters: F, initialSort: SortState) {
  const [filters, setFilters] = useState<F>(initialFilters)
  const [sort, setSort] = useState<SortState>(initialSort)
  const [page, setPage] = useState(1)

  const updateFilters = useCallback((patch: Partial<F>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }, [])

  const updateSort = useCallback((next: SortState) => {
    setSort(next)
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setPage(1)
  }, [initialFilters])

  return { filters, updateFilters, resetFilters, sort, updateSort, page, setPage }
}

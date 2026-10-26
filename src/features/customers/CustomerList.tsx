import { useMemo } from 'react'
import { Search, SearchX, UserPlus, Users } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, FilterBar, FilterField, Input, Pagination, Select } from '../../components/ui'
import { useTableState } from '../../hooks/useTableState'
import type { CustomerSummary } from '../../types'
import { cx } from '../../utils/cx'
import { pageCountFor, paginate, sortRows, sortValue } from '../../utils/table'
import { CustomerTable } from './CustomerTable'
import {
  CUSTOMER_SORT_ACCESSORS,
  CUSTOMER_SORT_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
  type CustomerFilters,
  type CustomerStatusFilter,
} from './filters'
import s from './CustomerList.module.css'

const PAGE_SIZE = 10

interface CustomerListProps {
  customers: CustomerSummary[] | undefined
  /** True while a (re)fetch is in flight. */
  loading: boolean
  error: Error | null
  onRetry: () => void
  onSelect: (id: string) => void
  onAdd: () => void
}

export function CustomerList({ customers, loading, error, onRetry, onSelect, onAdd }: CustomerListProps) {
  const table = useTableState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS, { key: 'lastActivity', direction: 'desc' })
  const { filters, sort, page } = table

  const visible = useMemo(
    () => sortRows(filterCustomers(customers ?? [], filters), sort, CUSTOMER_SORT_ACCESSORS),
    [customers, filters, sort],
  )
  const currentPage = Math.min(page, pageCountFor(visible.length, PAGE_SIZE))
  const initialLoad = !customers && !error
  const refreshing = loading && !!customers

  let body
  if (error) {
    body = <ErrorState title="Couldn't load customers" message={error.message} onRetry={onRetry} />
  } else if (customers && customers.length === 0) {
    body = (
      <EmptyState
        icon={<Users size={22} />}
        title="No customers yet"
        description="Customers you add will appear here."
        action={
          <Button icon={<UserPlus size={16} />} onClick={onAdd}>
            Add customer
          </Button>
        }
      />
    )
  } else if (customers && visible.length === 0) {
    body = (
      <EmptyState
        icon={<SearchX size={22} />}
        title="No results found"
        description="Try adjusting your search or filters."
        action={
          <Button variant="secondary" onClick={table.resetFilters}>
            Clear filters
          </Button>
        }
      />
    )
  } else {
    body = (
      <>
        <div className={cx(refreshing && s.stale)}>
          <CustomerTable
            rows={paginate(visible, currentPage, PAGE_SIZE)}
            loading={initialLoad}
            sort={sort}
            onSortChange={table.updateSort}
            onSelect={onSelect}
          />
        </div>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={table.setPage} noun="customers" />
      </>
    )
  }

  return (
    <Card padded={false} aria-busy={initialLoad || refreshing}>
      <FilterBar label="Customer filters">
        <FilterField grow>
          <Input
            label="Search customers"
            type="search"
            placeholder="Name, email or company"
            icon={<Search size={16} />}
            value={filters.query}
            disabled={initialLoad || !!error}
            onChange={(e) => table.updateFilters({ query: e.target.value })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Status"
            options={CUSTOMER_STATUS_OPTIONS}
            value={filters.status}
            disabled={initialLoad || !!error}
            onChange={(e) => table.updateFilters({ status: e.target.value as CustomerStatusFilter })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Sort by"
            options={CUSTOMER_SORT_OPTIONS}
            value={sortValue(sort)}
            disabled={initialLoad || !!error}
            onChange={(e) => {
              const next = CUSTOMER_SORT_OPTIONS.find((option) => option.value === e.target.value)
              if (next) table.updateSort({ key: next.key, direction: next.direction })
            }}
          />
        </FilterField>
      </FilterBar>
      <p className="sr-only" role="status">
        {customers && !error ? `${visible.length} ${visible.length === 1 ? 'customer' : 'customers'} found` : ''}
      </p>
      {body}
    </Card>
  )
}

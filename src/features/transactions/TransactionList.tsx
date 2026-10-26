import { useEffect, useMemo } from 'react'
import { Download, Receipt, Search, SearchX } from 'lucide-react'
import { Button, Card, EmptyState, ErrorState, FilterBar, FilterField, Input, Pagination, Select } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { useTableState } from '../../hooks/useTableState'
import type { Transaction } from '../../types'
import { cx } from '../../utils/cx'
import { downloadCsv, toCsv } from '../../utils/csv'
import { pageCountFor, paginate, sortRows, sortValue } from '../../utils/table'
import { TransactionTable } from './TransactionTable'
import {
  AMOUNT_OPTIONS,
  DATE_OPTIONS,
  DEFAULT_TRANSACTION_FILTERS,
  STATUS_FILTER_OPTIONS,
  TRANSACTION_SORT_ACCESSORS,
  TRANSACTION_SORT_OPTIONS,
  filterTransactions,
  type AmountFilter,
  type DateFilter,
  type TransactionFilters,
  type TransactionStatusFilter,
} from './filters'
import s from './TransactionList.module.css'

const PAGE_SIZE = 20

/** A search handed over by a deep link. Each new object re-applies it (and clears the other filters). */
export interface SearchSeed {
  query: string
}

interface TransactionListProps {
  transactions: Transaction[] | undefined
  loading: boolean
  error: Error | null
  onRetry: () => void
  onSelect: (id: string) => void
  searchSeed?: SearchSeed | null
}

export function TransactionList({ transactions, loading, error, onRetry, onSelect, searchSeed }: TransactionListProps) {
  const toast = useToast()
  const table = useTableState<TransactionFilters>(DEFAULT_TRANSACTION_FILTERS, { key: 'date', direction: 'desc' })
  const { filters, sort, page, resetFilters, updateFilters } = table

  useEffect(() => {
    if (!searchSeed) return
    resetFilters()
    updateFilters({ query: searchSeed.query })
  }, [searchSeed, resetFilters, updateFilters])

  const visible = useMemo(
    () => sortRows(filterTransactions(transactions ?? [], filters), sort, TRANSACTION_SORT_ACCESSORS),
    [transactions, filters, sort],
  )
  const currentPage = Math.min(page, pageCountFor(visible.length, PAGE_SIZE))
  const initialLoad = !transactions && !error
  const refreshing = loading && !!transactions
  const controlsDisabled = initialLoad || !!error

  // Exports everything matching the current filters and sort (not just the visible page). Demo data only.
  const exportCsv = () => {
    const header = ['Transaction ID', 'Customer', 'Amount (USD)', 'Payment method', 'Date', 'Status']
    const rows = visible.map((t) => [t.id, t.customerName, t.amount.toFixed(2), t.method, t.date, t.status])
    downloadCsv(`flowdesk-transactions-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]))
    toast.success(`Exported ${visible.length} ${visible.length === 1 ? 'transaction' : 'transactions'} as CSV (demo data).`)
  }

  let body
  if (error) {
    body = <ErrorState title="Couldn't load transactions" message={error.message} onRetry={onRetry} />
  } else if (transactions && transactions.length === 0) {
    body = <EmptyState icon={<Receipt size={22} />} title="No transactions yet" description="Payments you receive will appear here." />
  } else if (transactions && visible.length === 0) {
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
          <TransactionTable
            rows={paginate(visible, currentPage, PAGE_SIZE)}
            loading={initialLoad}
            sort={sort}
            onSortChange={table.updateSort}
            onSelect={onSelect}
          />
        </div>
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={visible.length} onPageChange={table.setPage} noun="transactions" />
      </>
    )
  }

  return (
    <Card padded={false} aria-busy={initialLoad || refreshing}>
      <FilterBar label="Transaction filters">
        <FilterField grow>
          <Input
            label="Search transactions"
            type="search"
            placeholder="ID, customer, method or amount"
            icon={<Search size={16} />}
            value={filters.query}
            disabled={controlsDisabled}
            onChange={(e) => table.updateFilters({ query: e.target.value })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Date"
            options={DATE_OPTIONS}
            value={filters.date}
            disabled={controlsDisabled}
            onChange={(e) => table.updateFilters({ date: e.target.value as DateFilter })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Status"
            options={STATUS_FILTER_OPTIONS}
            value={filters.status}
            disabled={controlsDisabled}
            onChange={(e) => table.updateFilters({ status: e.target.value as TransactionStatusFilter })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Amount"
            options={AMOUNT_OPTIONS}
            value={filters.amount}
            disabled={controlsDisabled}
            onChange={(e) => table.updateFilters({ amount: e.target.value as AmountFilter })}
          />
        </FilterField>
        <FilterField>
          <Select
            label="Sort by"
            options={TRANSACTION_SORT_OPTIONS}
            value={sortValue(sort)}
            disabled={controlsDisabled}
            onChange={(e) => {
              const next = TRANSACTION_SORT_OPTIONS.find((option) => option.value === e.target.value)
              if (next) table.updateSort({ key: next.key, direction: next.direction })
            }}
          />
        </FilterField>
        <FilterField fixed>
          <Button variant="secondary" icon={<Download size={16} />} disabled={controlsDisabled || visible.length === 0} onClick={exportCsv}>
            Export CSV
          </Button>
        </FilterField>
      </FilterBar>
      <p className="sr-only" role="status">
        {transactions && !error ? `${visible.length} ${visible.length === 1 ? 'transaction' : 'transactions'} found` : ''}
      </p>
      {body}
    </Card>
  )
}

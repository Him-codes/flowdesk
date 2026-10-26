import { Avatar, DataTable, type Column } from '../../components/ui'
import type { SortState, Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { StatusBadge } from './StatusBadge'
import s from './TransactionTable.module.css'

interface TransactionTableProps {
  rows: Transaction[]
  loading?: boolean
  sort: SortState
  onSortChange: (sort: SortState) => void
  onSelect: (id: string) => void
}

export function TransactionTable({ rows, loading, sort, onSortChange, onSelect }: TransactionTableProps) {
  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction ID',
      render: (t) => (
        <button
          type="button"
          className={s.idLink}
          aria-label={`View details for ${t.id}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(t.id)
          }}
        >
          {t.id}
        </button>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortable: true,
      render: (t) => (
        <span className={s.customer}>
          <Avatar name={t.customerName} size={28} />
          {t.customerName}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortable: true,
      defaultDirection: 'desc',
      render: (t) => <span className={s.amount}>{formatCurrency(t.amount)}</span>,
    },
    { key: 'method', header: 'Payment method', hideOnTablet: true, render: (t) => t.method },
    { key: 'date', header: 'Date', sortable: true, defaultDirection: 'desc', render: (t) => formatDate(t.date) },
    { key: 'status', header: 'Status', sortable: true, render: (t) => <StatusBadge status={t.status} /> },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      skeletonRows={10}
      getRowKey={(t) => t.id}
      caption="Transactions"
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={(t) => onSelect(t.id)}
    />
  )
}

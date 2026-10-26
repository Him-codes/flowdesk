import { Avatar, Button, DataTable, type Column } from '../../components/ui'
import type { CustomerSummary, SortState } from '../../types'
import { formatCurrency, formatRelative } from '../../utils/format'
import { CustomerStatusBadge } from './CustomerStatusBadge'
import s from './CustomerTable.module.css'

interface CustomerTableProps {
  rows: CustomerSummary[]
  loading?: boolean
  sort: SortState
  onSortChange: (sort: SortState) => void
  onSelect: (id: string) => void
}

export function CustomerTable({ rows, loading, sort, onSortChange, onSelect }: CustomerTableProps) {
  const columns: Column<CustomerSummary>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (c) => (
        <span className={s.nameCell}>
          <Avatar name={c.name} size={32} />
          <span className={s.nameText}>
            <span className={s.name}>{c.name}</span>
            {/* Shown only at tablet widths, where the Email and Company columns are hidden. */}
            <span className={s.sub}>
              {c.company} · {c.email}
            </span>
          </span>
        </span>
      ),
    },
    { key: 'email', header: 'Email', hideOnTablet: true, render: (c) => <span className={s.muted}>{c.email}</span> },
    { key: 'company', header: 'Company', sortable: true, hideOnTablet: true, render: (c) => c.company },
    { key: 'status', header: 'Status', render: (c) => <CustomerStatusBadge status={c.status} /> },
    {
      key: 'totalSpent',
      header: 'Total spent',
      align: 'end',
      sortable: true,
      defaultDirection: 'desc',
      render: (c) => <span className={s.amount}>{formatCurrency(c.totalSpent)}</span>,
    },
    {
      key: 'lastActivity',
      header: 'Last activity',
      sortable: true,
      defaultDirection: 'desc',
      render: (c) => <time dateTime={c.lastActivity}>{formatRelative(c.lastActivity)}</time>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (c) => (
        <Button
          size="sm"
          variant="secondary"
          aria-label={`View ${c.name}`}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(c.id)
          }}
        >
          View
        </Button>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      rows={rows}
      loading={loading}
      skeletonRows={8}
      getRowKey={(c) => c.id}
      caption="Customers"
      sort={sort}
      onSortChange={onSortChange}
      onRowClick={(c) => onSelect(c.id)}
    />
  )
}

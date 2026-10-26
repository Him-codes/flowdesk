import { Link } from 'react-router-dom'
import { Receipt } from 'lucide-react'
import { Avatar, Card, DataTable, EmptyState, ErrorState, type Column } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { StatusBadge } from '../transactions/StatusBadge'
import s from './RecentTransactions.module.css'

const COLUMNS: Column<Transaction>[] = [
  {
    key: 'customer',
    header: 'Customer',
    render: (t) => (
      <span className={s.customer}>
        <Avatar name={t.customerName} size={28} />
        {t.customerName}
      </span>
    ),
  },
  { key: 'id', header: 'Transaction ID', render: (t) => <span className={s.id}>{t.id}</span> },
  { key: 'amount', header: 'Amount', align: 'end', render: (t) => <span className={s.amount}>{formatCurrency(t.amount)}</span> },
  { key: 'date', header: 'Date', render: (t) => formatDate(t.date) },
  { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
]

export function RecentTransactions() {
  const { data, error, reload } = useAsync((signal) => api.getRecentTransactions(8, { signal }), [])

  return (
    <Card as="section" padded={false} aria-labelledby="recent-transactions-heading">
      <div className={s.header}>
        <h2 id="recent-transactions-heading" className={s.title}>
          Recent transactions
        </h2>
        <Link to="/transactions" className={s.link}>
          View all
        </Link>
      </div>
      {error ? (
        <ErrorState title="Couldn't load transactions" message={error.message} onRetry={reload} />
      ) : data && data.length === 0 ? (
        <EmptyState icon={<Receipt size={22} />} title="No transactions yet" description="Payments you receive will appear here." />
      ) : (
        <DataTable columns={COLUMNS} rows={data ?? []} loading={!data} skeletonRows={6} getRowKey={(t) => t.id} caption="Recent transactions" />
      )}
    </Card>
  )
}

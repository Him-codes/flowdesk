import { Link } from 'react-router-dom'
import { Avatar, DataTable, DescriptionList, ErrorState, Modal, Skeleton, type Column } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import { transactionsLink } from '../../routes'
import type { Transaction } from '../../types'
import { formatCurrency, formatDate } from '../../utils/format'
import { ActivityRow } from '../activity/ActivityRow'
import { StatusBadge } from '../transactions/StatusBadge'
import { CustomerStatusBadge } from './CustomerStatusBadge'
import s from './CustomerDetailsModal.module.css'

const HISTORY_COLUMNS: Column<Transaction>[] = [
  { key: 'id', header: 'Transaction ID', render: (t) => <span className={s.id}>{t.id}</span> },
  { key: 'date', header: 'Date', render: (t) => formatDate(t.date) },
  { key: 'method', header: 'Method', render: (t) => t.method },
  { key: 'amount', header: 'Amount', align: 'end', render: (t) => formatCurrency(t.amount) },
  { key: 'status', header: 'Status', render: (t) => <StatusBadge status={t.status} /> },
]

function LoadingSkeleton() {
  return (
    <div className={s.skeleton} aria-busy="true" aria-label="Loading customer details">
      <div className={s.skeletonRow}>
        <Skeleton width={56} height={56} radius="50%" />
        <div className={s.skeletonLines}>
          <Skeleton height={20} width="50%" />
          <Skeleton height={14} width="35%" />
        </div>
      </div>
      <Skeleton height={64} radius={12} />
      <Skeleton height={120} radius={12} />
      <Skeleton height={160} radius={12} />
    </div>
  )
}

function CustomerDetailsContent({ id }: { id: string }) {
  const { data, error, reload } = useAsync((signal) => api.getCustomerDetail(id, { signal }), [id])

  if (error) return <ErrorState title="Couldn't load this customer" message={error.message} onRetry={reload} />
  if (!data) return <LoadingSkeleton />

  const { customer, recentActivity, transactions } = data
  return (
    <div className={s.content}>
      <div className={s.profile}>
        <Avatar name={customer.name} size={56} />
        <div className={s.who}>
          <p className={s.name}>{customer.name}</p>
          <p className={s.company}>{customer.company}</p>
          <CustomerStatusBadge status={customer.status} />
        </div>
      </div>

      <div className={s.stats}>
        <div className={s.stat}>
          <p className={s.statLabel}>Total spent</p>
          <p className={s.statValue}>{formatCurrency(customer.totalSpent)}</p>
        </div>
        <div className={s.stat}>
          <p className={s.statLabel}>Transactions</p>
          <p className={s.statValue}>{customer.transactionCount}</p>
        </div>
        <div className={s.stat}>
          <p className={s.statLabel}>Customer since</p>
          <p className={s.statValue}>{formatDate(customer.joinedAt)}</p>
        </div>
      </div>

      <section>
        <h3 className={s.heading}>Contact information</h3>
        <DescriptionList
          items={[
            { label: 'Email', value: customer.email },
            { label: 'Phone', value: customer.phone || 'Not provided' },
            { label: 'Location', value: customer.location || 'Not provided' },
            { label: 'Company', value: customer.company },
          ]}
        />
      </section>

      <section>
        <h3 className={s.heading}>Recent activity</h3>
        <ul className={s.list}>
          {recentActivity.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </section>

      <section>
        <div className={s.sectionHeader}>
          <h3 className={s.heading}>Transaction history</h3>
          {transactions.length > 0 && (
            <Link to={transactionsLink(customer.name)} className={s.link} aria-label={`View all transactions for ${customer.name}`}>
              View all transactions
            </Link>
          )}
        </div>
        {transactions.length === 0 ? (
          <p className={s.muted}>No transactions yet. Payments from this customer will appear here.</p>
        ) : (
          <>
            <DataTable columns={HISTORY_COLUMNS} rows={transactions} getRowKey={(t) => t.id} caption={`Transactions for ${customer.name}`} />
            {customer.transactionCount > transactions.length && (
              <p className={`${s.muted} ${s.note}`}>
                Showing the latest {transactions.length} of {customer.transactionCount} transactions.
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}

interface CustomerDetailsModalProps {
  /** `null` keeps the dialog closed. */
  customerId: string | null
  onClose: () => void
}

export function CustomerDetailsModal({ customerId, onClose }: CustomerDetailsModalProps) {
  return (
    <Modal open={customerId !== null} onClose={onClose} title="Customer details" size="lg">
      {customerId !== null && <CustomerDetailsContent id={customerId} />}
    </Modal>
  )
}

import { Link } from 'react-router-dom'
import { DescriptionList, ErrorState, Modal, Skeleton, type DescriptionItem } from '../../components/ui'
import { api } from '../../data/api'
import { useAsync } from '../../hooks/useAsync'
import { customerLink } from '../../routes'
import { formatCurrency, formatDateTime } from '../../utils/format'
import { StatusBadge } from './StatusBadge'
import s from './TransactionDetailsModal.module.css'

function LoadingSkeleton() {
  return (
    <div className={s.skeleton} aria-busy="true" aria-label="Loading transaction details">
      <Skeleton height={36} width="45%" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} height={20} />
      ))}
    </div>
  )
}

function TransactionDetailsContent({ id }: { id: string }) {
  const { data, error, reload } = useAsync((signal) => api.getTransactionDetail(id, { signal }), [id])

  if (error) return <ErrorState title="Couldn't load this transaction" message={error.message} onRetry={reload} />
  if (!data) return <LoadingSkeleton />

  const { transaction: t, customer, reference, paymentDetail, fee, net, failureReason } = data
  const items: DescriptionItem[] = [
    { label: 'Transaction ID', value: t.id },
    { label: 'Reference', value: reference },
    { label: 'Date and time', value: formatDateTime(t.date) },
    { label: 'Payment method', value: t.method },
    { label: 'Payment details', value: paymentDetail },
    {
      label: 'Customer',
      value: (
        <Link to={customerLink(customer.id)} className={s.link} aria-label={`${customer.name}, view customer`}>
          {customer.name}
        </Link>
      ),
    },
    { label: 'Email', value: customer.email },
    { label: 'Company', value: customer.company },
    { label: 'Processing fee', value: fee === null ? '—' : formatCurrency(fee) },
    { label: 'Net amount', value: net === null ? '—' : formatCurrency(net) },
  ]
  if (failureReason) items.push({ label: 'Failure reason', value: failureReason })

  return (
    <div className={s.content}>
      <div className={s.hero}>
        <p className={s.amount}>{formatCurrency(t.amount)}</p>
        <StatusBadge status={t.status} />
      </div>
      {t.status === 'Pending' && <p className={s.message}>Waiting for confirmation from the payment provider. Fees are calculated once the payment completes.</p>}
      {t.status === 'Failed' && <p className={s.message}>This payment did not go through and no funds were collected.</p>}
      <DescriptionList items={items} />
      <p className={s.note}>Simulated transaction. No real payment was processed, and fees shown are illustrative.</p>
    </div>
  )
}

interface TransactionDetailsModalProps {
  /** `null` keeps the dialog closed. */
  transactionId: string | null
  onClose: () => void
}

export function TransactionDetailsModal({ transactionId, onClose }: TransactionDetailsModalProps) {
  return (
    <Modal open={transactionId !== null} onClose={onClose} title="Transaction details">
      {transactionId !== null && <TransactionDetailsContent id={transactionId} />}
    </Modal>
  )
}

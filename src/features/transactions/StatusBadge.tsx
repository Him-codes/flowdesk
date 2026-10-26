import type { TransactionStatus } from '../../types'
import { Badge, type BadgeTone } from '../../components/ui'

const TONES: Record<TransactionStatus, BadgeTone> = { Completed: 'success', Pending: 'warning', Failed: 'error' }

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge tone={TONES[status]}>{status}</Badge>
}

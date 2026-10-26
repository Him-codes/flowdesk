import { Badge, type BadgeTone } from '../../components/ui'
import type { CustomerStatus } from '../../types'

const TONES: Record<CustomerStatus, BadgeTone> = { Active: 'success', Inactive: 'neutral', New: 'accent' }

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  return <Badge tone={TONES[status]}>{status}</Badge>
}

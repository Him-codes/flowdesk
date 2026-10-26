import { Badge, type BadgeTone } from '../../components/ui'
import type { TaskPriority, TaskStatus } from '../../types'

const PRIORITY_TONES: Record<TaskPriority, BadgeTone> = { High: 'error', Medium: 'warning', Low: 'neutral' }
const STATUS_TONES: Record<TaskStatus, BadgeTone> = { 'To Do': 'neutral', 'In Progress': 'info', Completed: 'success' }

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge tone={PRIORITY_TONES[priority]}>{priority} priority</Badge>
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={STATUS_TONES[status]}>{status}</Badge>
}

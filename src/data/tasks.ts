import type { Task, TaskInput, TaskPriority, TaskStatus } from '../types'
import { dateKeyOffset, isValidDateKey } from '../utils/dates'
import { STORAGE_KEYS, readStored } from '../utils/storage'
import { DAY_MS, HOUR_MS, NOW } from './clock'
import { ME } from './team'

export const TASK_STATUSES: TaskStatus[] = ['To Do', 'In Progress', 'Completed']
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High']

const iso = (msAgo: number) => new Date(NOW - msAgo).toISOString()

/** Starter tasks, dated relative to the first visit. Once saved to localStorage they keep their dates. */
export function createSeedTasks(): Task[] {
  const due = (days: number) => dateKeyOffset(days, NOW)
  const base = { createdAt: iso(6 * DAY_MS) }
  return [
    { ...base, id: 'task-seed-1', name: 'Send Q3 invoices', description: 'Issue invoices to all active accounts and confirm delivery.', priority: 'High', status: 'Completed', dueDate: due(-1), assignee: ME, completedAt: iso(5 * HOUR_MS) },
    { ...base, id: 'task-seed-2', name: 'Review vendor contract', description: 'Check renewal terms and flag anything that needs legal review.', priority: 'Medium', status: 'Completed', dueDate: due(-2), assignee: 'Daniel', completedAt: iso(27 * HOUR_MS) },
    { ...base, id: 'task-seed-3', name: 'Set up payment reminders', description: 'Automate reminders for invoices that are 7 days overdue.', priority: 'Low', status: 'Completed', dueDate: due(-5), assignee: 'Amara', completedAt: iso(3 * DAY_MS) },
    { ...base, id: 'task-seed-4', name: 'Follow up with Northstar Studio', description: 'Confirm renewal terms and send the updated proposal.', priority: 'High', status: 'In Progress', dueDate: due(0), assignee: ME },
    { ...base, id: 'task-seed-5', name: 'Reconcile failed payments', description: 'Contact customers whose payments failed this week and retry where possible.', priority: 'High', status: 'To Do', dueDate: due(-1), assignee: 'Priya' },
    { ...base, id: 'task-seed-6', name: 'Prepare monthly revenue report', description: 'Summarise revenue, new customers and churn for the leadership review.', priority: 'Medium', status: 'In Progress', dueDate: due(2), assignee: ME },
    { ...base, id: 'task-seed-7', name: 'Reply to support backlog', description: 'Clear the open customer questions older than 48 hours.', priority: 'Medium', status: 'To Do', dueDate: due(1), assignee: 'Lucas' },
    { ...base, id: 'task-seed-8', name: 'Update onboarding checklist', description: 'Add the new billing steps to the checklist for new customers.', priority: 'Medium', status: 'To Do', dueDate: due(4), assignee: 'Amara' },
    { ...base, id: 'task-seed-9', name: 'Plan Q4 pricing review', description: 'Compare current plans against usage data and draft options.', priority: 'Low', status: 'To Do', dueDate: due(10), assignee: 'Daniel' },
    { ...base, id: 'task-seed-10', name: 'Archive inactive accounts', description: 'Review accounts with no activity in 120 days.', priority: 'Low', status: 'To Do', dueDate: due(14), assignee: '' },
  ]
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false
  const t = value as Record<string, unknown>
  return (
    typeof t.id === 'string' &&
    typeof t.name === 'string' &&
    typeof t.description === 'string' &&
    TASK_PRIORITIES.includes(t.priority as TaskPriority) &&
    TASK_STATUSES.includes(t.status as TaskStatus) &&
    typeof t.dueDate === 'string' &&
    isValidDateKey(t.dueDate) &&
    typeof t.assignee === 'string' &&
    typeof t.createdAt === 'string' &&
    (t.completedAt === undefined || typeof t.completedAt === 'string')
  )
}

/**
 * Recovers what it can from stored tasks: invalid or duplicate entries are dropped and `completedAt` is made
 * consistent with `status`. Returns undefined (use the starter tasks) when the value isn't a list or every entry
 * was unusable. An empty list is valid: it means the user deleted all their tasks.
 */
export function parseTasks(value: unknown): Task[] | undefined {
  if (!Array.isArray(value)) return undefined
  const seen = new Set<string>()
  const tasks: Task[] = []
  for (const item of value) {
    if (!isTask(item) || seen.has(item.id)) continue
    seen.add(item.id)
    tasks.push(item.status === 'Completed' ? { ...item, completedAt: item.completedAt ?? item.createdAt } : { ...item, completedAt: undefined })
  }
  return tasks.length === 0 && value.length > 0 ? undefined : tasks
}

/** The saved tasks, or the starter tasks if nothing usable is stored. Only the Tasks provider calls this. */
export const loadStoredTasks = (): Task[] => readStored(STORAGE_KEYS.tasks, createSeedTasks, parseTasks)

export type TaskAction =
  | { type: 'add'; task: Task }
  | { type: 'update'; id: string; input: TaskInput }
  | { type: 'setStatus'; id: string; status: TaskStatus }
  | { type: 'delete'; id: string }
  /** Another browser tab changed the saved tasks. */
  | { type: 'replace'; tasks: Task[] }

/** Changes status and keeps `completedAt` consistent with it. */
export function withStatus(task: Task, status: TaskStatus, now = new Date().toISOString()): Task {
  if (task.status === status) return task
  return { ...task, status, completedAt: status === 'Completed' ? now : undefined }
}

export function tasksReducer(tasks: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'add':
      return [action.task, ...tasks]
    case 'update': {
      // Apply the other fields first so withStatus still sees the old status and can stamp/clear completedAt.
      const { status, ...fields } = action.input
      return tasks.map((t) => (t.id === action.id ? withStatus({ ...t, ...fields }, status) : t))
    }
    case 'setStatus':
      return tasks.map((t) => (t.id === action.id ? withStatus(t, action.status) : t))
    case 'delete':
      return tasks.filter((t) => t.id !== action.id)
    case 'replace':
      return action.tasks
  }
}

export function createTask(input: TaskInput, now = new Date().toISOString()): Task {
  return {
    ...input,
    id: `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    completedAt: input.status === 'Completed' ? now : undefined,
  }
}

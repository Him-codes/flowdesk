import type { AppNotification, Task } from '../types'
import { customerLink, ROUTES, transactionsLink } from '../routes'
import { toDateKey } from '../utils/dates'
import { formatCurrency } from '../utils/format'
import { DAY_MS, HOUR_MS, NOW } from './clock'
import { customers } from './customers'
import { transactions } from './transactions'

/** Notifications older than this arrive already read. */
const READ_AFTER_MS = 48 * HOUR_MS

type Draft = Omit<AppNotification, 'read'>

const withReadState = (drafts: Draft[], now: number): AppNotification[] =>
  drafts.map((d) => ({ ...d, read: now - Date.parse(d.timestamp) > READ_AFTER_MS }))

/** The "server" feed: payments, new customers and system notices. Task notifications are built locally (see below). */
export function buildNotifications(): AppNotification[] {
  const drafts: Draft[] = []
  const recent = transactions.slice(0, 250)

  recent
    .filter((t) => t.status === 'Completed' && t.method !== 'Bank transfer')
    .slice(0, 3)
    .forEach((t) =>
      drafts.push({ id: `pay-${t.id}`, type: 'payment', title: 'Payment received', message: `${formatCurrency(t.amount)} from ${t.customerName} via ${t.method}.`, timestamp: t.date, href: transactionsLink(t.id), linkLabel: 'View transaction' }),
    )

  recent
    .filter((t) => t.status === 'Failed')
    .slice(0, 1)
    .forEach((t) =>
      drafts.push({ id: `fail-${t.id}`, type: 'payment', title: 'Payment failed', message: `${formatCurrency(t.amount)} from ${t.customerName} could not be processed.`, timestamp: t.date, tone: 'error', href: transactionsLink(t.id), linkLabel: 'View transaction' }),
    )

  customers
    .slice(-3)
    .forEach((c) =>
      drafts.push({ id: `cus-${c.id}`, type: 'customer', title: 'New customer registered', message: `${c.name} from ${c.company} just joined.`, timestamp: c.joinedAt, href: customerLink(c.id), linkLabel: 'View customer' }),
    )

  drafts.push(
    { id: 'sys-demo', type: 'system', title: 'You’re viewing demo data', message: 'Everything in FlowDesk is simulated. No real payments, customers or emails are involved.', timestamp: new Date(NOW - 45 * 60_000).toISOString() },
    { id: 'sys-summary', type: 'system', title: 'Weekly summary ready', message: 'Your revenue and customer summary for last week is ready to view.', timestamp: new Date(NOW - 30 * HOUR_MS).toISOString(), href: ROUTES.analytics, linkLabel: 'View analytics' },
    { id: 'sys-security', type: 'system', title: 'Review your security settings', message: 'Two-factor authentication is off. The security controls in Settings are a UI demo only.', timestamp: new Date(NOW - 4 * DAY_MS).toISOString(), href: ROUTES.settings, linkLabel: 'Open settings' },
  )

  return withReadState(drafts, NOW)
}

const nineAm = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d, 9).getTime()
}

/**
 * Notifications derived from the user's own tasks. The tasks live in the browser, so this is computed on the spot
 * from the live task list (no simulated network delay): completing, reopening, editing or deleting a task updates
 * the feed immediately. IDs come from task IDs, so read state sticks to the right item.
 */
export function buildTaskNotifications(tasks: Task[], now: number = Date.now()): AppNotification[] {
  const today = toDateKey(new Date(now))
  const open = tasks.filter((t) => t.status !== 'Completed')
  const drafts: Draft[] = []

  open
    .filter((t) => t.dueDate < today)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    .slice(0, 2)
    .forEach((t) =>
      drafts.push({ id: `task-overdue-${t.id}`, type: 'task', title: 'Task overdue', message: `“${t.name}” was due on ${t.dueDate}.`, timestamp: new Date(nineAm(t.dueDate) + DAY_MS).toISOString(), tone: 'warning', href: ROUTES.tasks, linkLabel: 'View tasks' }),
    )

  open
    .filter((t) => t.dueDate === today)
    .slice(0, 2)
    .forEach((t) =>
      drafts.push({ id: `task-due-${t.id}`, type: 'task', title: 'Task due today', message: `“${t.name}” is due today.`, timestamp: new Date(Math.min(now - 15 * 60_000, nineAm(today))).toISOString(), href: ROUTES.tasks, linkLabel: 'View tasks' }),
    )

  tasks
    .flatMap((t) => (t.status === 'Completed' && t.completedAt ? [{ t, at: t.completedAt }] : []))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 3)
    .forEach(({ t, at }) =>
      drafts.push({ id: `task-done-${t.id}`, type: 'task', title: 'Task completed', message: `“${t.name}” was marked as completed.`, timestamp: at, href: ROUTES.tasks, linkLabel: 'View tasks' }),
    )

  return withReadState(drafts, now)
}

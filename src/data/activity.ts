import type { ActivityItem, Task } from '../types'
import { customerLink, ROUTES, transactionsLink } from '../routes'
import { formatCurrency } from '../utils/format'
import { customers } from './customers'
import { transactions } from './transactions'

/** Recent business events from the "server" data (payments, invoices, customers), newest first. */
export function buildActivity(limit: number): ActivityItem[] {
  const recent = transactions.slice(0, 250)
  const completed = recent.filter((t) => t.status === 'Completed')
  const items: ActivityItem[] = []

  completed
    .filter((t) => t.method !== 'Bank transfer')
    .slice(0, 4)
    .forEach((t) =>
      items.push({ id: `pay-${t.id}`, type: 'payment', title: 'Payment received', description: `${formatCurrency(t.amount)} from ${t.customerName}`, timestamp: t.date, href: transactionsLink(t.id), linkLabel: 'View transaction' }),
    )

  completed
    .filter((t) => t.method === 'Bank transfer')
    .slice(0, 2)
    .forEach((t) =>
      items.push({ id: `inv-${t.id}`, type: 'invoice', title: 'Invoice paid', description: `INV-${t.id.slice(4)} settled by ${t.customerName}`, timestamp: t.date, href: transactionsLink(t.id), linkLabel: 'View transaction' }),
    )

  recent
    .filter((t) => t.status === 'Failed')
    .slice(0, 1)
    .forEach((t) =>
      items.push({ id: `fail-${t.id}`, type: 'payment', title: 'Payment failed', description: `${formatCurrency(t.amount)} from ${t.customerName}`, timestamp: t.date, tone: 'error', href: transactionsLink(t.id), linkLabel: 'View transaction' }),
    )

  customers
    .slice(-3)
    .forEach((c) =>
      items.push({ id: `cus-${c.id}`, type: 'customer', title: 'New customer registered', description: `${c.name} · ${c.company}`, timestamp: c.joinedAt, href: customerLink(c.id), linkLabel: 'View customer' }),
    )

  return items.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, limit)
}

/** "Task completed" events from the live task list (local data, so no simulated delay). */
export function buildTaskActivity(tasks: Task[], limit = 2): ActivityItem[] {
  return tasks
    .flatMap((t) => (t.status === 'Completed' && t.completedAt ? [{ id: t.id, name: t.name, at: t.completedAt }] : []))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, limit)
    .map((t) => ({ id: `task-${t.id}`, type: 'task' as const, title: 'Task completed', description: t.name, timestamp: t.at, href: ROUTES.tasks, linkLabel: 'View tasks' }))
}

import type { Task, TaskPriority, TaskStatus } from '../../types'
import { daysBetween, parseDateKey } from '../../utils/dates'
import { formatShortDate } from '../../utils/format'

export type StatusTab = 'all' | 'todo' | 'in-progress' | 'completed'

export const TAB_STATUS: Record<StatusTab, TaskStatus | null> = {
  all: null,
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
}

export const UNASSIGNED = 'unassigned'

export interface TaskFilters {
  query: string
  priority: 'all' | TaskPriority
  /** 'all', 'unassigned', or a team member's name. */
  assignee: string
}

export const DEFAULT_TASK_FILTERS: TaskFilters = { query: '', priority: 'all', assignee: 'all' }

/** Applies search, priority and assignee (not the status tab, so tab counts can reflect the other filters). */
export function filterTasks(tasks: Task[], filters: TaskFilters, labelOf: (assignee: string) => string = (assignee) => assignee): Task[] {
  const query = filters.query.trim().toLowerCase()
  return tasks.filter((t) => {
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    if (filters.assignee === UNASSIGNED ? t.assignee !== '' : filters.assignee !== 'all' && t.assignee !== filters.assignee) return false
    return !query || [t.name, t.description, labelOf(t.assignee)].some((value) => value.toLowerCase().includes(query))
  })
}

export function countByTab(tasks: Task[]): Record<StatusTab, number> {
  const count = (status: TaskStatus) => tasks.filter((t) => t.status === status).length
  return { all: tasks.length, todo: count('To Do'), 'in-progress': count('In Progress'), completed: count('Completed') }
}

const PRIORITY_RANK: Record<TaskPriority, number> = { High: 0, Medium: 1, Low: 2 }

/** Open tasks first (soonest due, then highest priority); completed tasks last, most recently finished first. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === 'Completed'
    const bDone = b.status === 'Completed'
    if (aDone !== bDone) return aDone ? 1 : -1
    if (aDone) return (b.completedAt ?? '').localeCompare(a.completedAt ?? '')
    return a.dueDate.localeCompare(b.dueDate) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.name.localeCompare(b.name)
  })
}

export type DueState = 'overdue' | 'today' | 'soon' | 'normal' | 'done'

/** Human label for a due date. State is conveyed in the text as well as the colour. */
export function describeDue(task: Task, todayKey: string): { label: string; state: DueState } {
  const short = formatShortDate(parseDateKey(task.dueDate))
  if (task.status === 'Completed') return { label: `Due ${short}`, state: 'done' }
  const diff = daysBetween(todayKey, task.dueDate)
  if (diff < 0) return { label: `Overdue by ${-diff} ${-diff === 1 ? 'day' : 'days'}`, state: 'overdue' }
  if (diff === 0) return { label: 'Due today', state: 'today' }
  if (diff === 1) return { label: 'Due tomorrow', state: 'soon' }
  return { label: `Due ${short}`, state: 'normal' }
}

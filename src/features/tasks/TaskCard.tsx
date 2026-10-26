import { ArrowRight, Calendar, Check, MoreHorizontal, Pencil, Trash2, User } from 'lucide-react'
import { Avatar, Dropdown, type DropdownItem } from '../../components/ui'
import { TASK_STATUSES } from '../../data/tasks'
import type { Task, TaskStatus } from '../../types'
import { cx } from '../../utils/cx'
import { useAssigneeLabel } from './useAssigneeLabel'
import { PriorityBadge, TaskStatusBadge } from './TaskBadges'
import { describeDue } from './taskLogic'
import s from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  /** Today's date as `YYYY-MM-DD`, used for overdue / due-today labels. */
  todayKey: string
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onSetStatus: (task: Task, status: TaskStatus) => void
}

export function TaskCard({ task, todayKey, onToggle, onEdit, onDelete, onSetStatus }: TaskCardProps) {
  const done = task.status === 'Completed'
  const due = describeDue(task, todayKey)
  const assignee = useAssigneeLabel()(task.assignee)

  const menuItems: DropdownItem[] = [
    { id: 'edit', label: 'Edit task', icon: <Pencil size={16} aria-hidden="true" />, onSelect: () => onEdit(task) },
    ...TASK_STATUSES.filter((status) => status !== task.status).map((status) => ({
      id: `status-${status}`,
      label: `Move to ${status}`,
      icon: <ArrowRight size={16} aria-hidden="true" />,
      onSelect: () => onSetStatus(task, status),
    })),
    { id: 'delete', label: 'Delete task', icon: <Trash2 size={16} aria-hidden="true" />, danger: true, onSelect: () => onDelete(task) },
  ]

  return (
    <li className={cx(s.card, done && s.done)}>
      <button type="button" className={cx(s.check, done && s.checked)} aria-pressed={done} aria-label={`Mark “${task.name}” as complete`} onClick={() => onToggle(task)}>
        <span className={s.box} aria-hidden="true">
          {done && <Check size={14} strokeWidth={3} />}
        </span>
      </button>
      <div className={s.body}>
        <p className={s.name}>{task.name}</p>
        {task.description && <p className={s.desc}>{task.description}</p>}
        <div className={s.meta}>
          <PriorityBadge priority={task.priority} />
          <TaskStatusBadge status={task.status} />
          <span className={cx(s.due, due.state === 'overdue' && s.overdue, due.state === 'today' && s.today)}>
            <Calendar size={14} aria-hidden="true" />
            {due.label}
          </span>
          <span className={s.assignee}>
            {task.assignee ? <Avatar name={assignee} size={22} /> : <User size={16} aria-hidden="true" />}
            {assignee || 'Unassigned'}
          </span>
        </div>
      </div>
      <div className={s.menu}>
        <Dropdown label={`Actions for ${task.name}`} items={menuItems} trigger={<MoreHorizontal size={18} aria-hidden="true" />} />
      </div>
    </li>
  )
}

import { useMemo, useState } from 'react'
import { ClipboardList, Plus, Search, SearchX } from 'lucide-react'
import { Button, Card, EmptyState, FilterBar, FilterField, Input, Select, Tabs, type SelectOption, type TabItem } from '../../components/ui'
import { TEAM } from '../../data/team'
import type { Task, TaskPriority, TaskStatus } from '../../types'
import { toDateKey } from '../../utils/dates'
import { TaskCard } from './TaskCard'
import { useAssigneeLabel } from './useAssigneeLabel'
import { DEFAULT_TASK_FILTERS, TAB_STATUS, UNASSIGNED, countByTab, filterTasks, sortTasks, type StatusTab, type TaskFilters } from './taskLogic'
import s from './TaskList.module.css'

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]
const TAB_EMPTY: Record<Exclude<StatusTab, 'all'>, { title: string; description: string }> = {
  todo: { title: 'You’re all caught up', description: 'No tasks are waiting to be started.' },
  'in-progress': { title: 'Nothing in progress', description: 'Tasks you start working on will appear here.' },
  completed: { title: 'Nothing completed yet', description: 'Tasks you finish will appear here.' },
}

interface TaskListProps {
  tasks: Task[]
  onAdd: () => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onSetStatus: (task: Task, status: TaskStatus) => void
}

export function TaskList({ tasks, onAdd, onToggle, onEdit, onDelete, onSetStatus }: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS)
  const [tab, setTab] = useState<StatusTab>('all')
  const labelOf = useAssigneeLabel()
  const assigneeOptions = useMemo<SelectOption[]>(
    () => [{ value: 'all', label: 'All assignees' }, ...TEAM.map((name) => ({ value: name, label: labelOf(name) })), { value: UNASSIGNED, label: 'Unassigned' }],
    [labelOf],
  )

  const matching = useMemo(() => filterTasks(tasks, filters, labelOf), [tasks, filters, labelOf])
  const counts = useMemo(() => countByTab(matching), [matching])
  const visible = useMemo(() => {
    const status = TAB_STATUS[tab]
    return sortTasks(status ? matching.filter((t) => t.status === status) : matching)
  }, [matching, tab])

  const filtered = filters.query.trim() !== '' || filters.priority !== 'all' || filters.assignee !== 'all'
  const update = (patch: Partial<TaskFilters>) => setFilters((current) => ({ ...current, ...patch }))
  const todayKey = toDateKey(new Date())

  const tabs: TabItem[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'todo', label: 'To Do', count: counts.todo },
    { id: 'in-progress', label: 'In Progress', count: counts['in-progress'] },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ]

  let body
  if (tasks.length === 0) {
    body = (
      <EmptyState
        icon={<ClipboardList size={22} />}
        title="No tasks yet"
        description="Create your first task to start organizing your work."
        action={
          <Button icon={<Plus size={16} />} onClick={onAdd}>
            Add task
          </Button>
        }
      />
    )
  } else if (visible.length === 0 && filtered) {
    body = (
      <EmptyState
        icon={<SearchX size={22} />}
        title="No results found"
        description="Try adjusting your search or filters."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              setFilters(DEFAULT_TASK_FILTERS)
              setTab('all')
            }}
          >
            Clear filters
          </Button>
        }
      />
    )
  } else if (visible.length === 0 && tab !== 'all') {
    body = <EmptyState icon={<ClipboardList size={22} />} title={TAB_EMPTY[tab].title} description={TAB_EMPTY[tab].description} />
  } else {
    body = (
      <ul className={s.list}>
        {visible.map((task) => (
          <TaskCard key={task.id} task={task} todayKey={todayKey} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} onSetStatus={onSetStatus} />
        ))}
      </ul>
    )
  }

  return (
    <Card padded={false}>
      <FilterBar label="Task filters">
        <FilterField grow>
          <Input label="Search tasks" type="search" placeholder="Name, description or assignee" icon={<Search size={16} />} value={filters.query} onChange={(e) => update({ query: e.target.value })} />
        </FilterField>
        <FilterField>
          <Select label="Priority" options={PRIORITY_OPTIONS} value={filters.priority} onChange={(e) => update({ priority: e.target.value as 'all' | TaskPriority })} />
        </FilterField>
        <FilterField>
          <Select label="Assignee" options={assigneeOptions} value={filters.assignee} onChange={(e) => update({ assignee: e.target.value })} />
        </FilterField>
      </FilterBar>
      <div className={s.tabs}>
        <Tabs tabs={tabs} value={tab} onChange={(id) => setTab(id as StatusTab)} label="Filter tasks by status" idPrefix="tasks" />
      </div>
      <p className="sr-only" role="status">
        {`${visible.length} ${visible.length === 1 ? 'task' : 'tasks'} shown`}
      </p>
      <div role="tabpanel" id={`tasks-panel-${tab}`} aria-labelledby={`tasks-tab-${tab}`}>
        {body}
      </div>
    </Card>
  )
}

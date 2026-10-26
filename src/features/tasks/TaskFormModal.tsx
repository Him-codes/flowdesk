import { useState, type FormEvent } from 'react'
import { Button, Input, Modal, Select, Textarea, type SelectOption } from '../../components/ui'
import { useTasks } from '../../context/TasksContext'
import { useToast } from '../../context/ToastContext'
import { TASK_STATUSES } from '../../data/tasks'
import { ME, TEAM } from '../../data/team'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../../types'
import { dateKeyOffset } from '../../utils/dates'
import { useAssigneeLabel } from './useAssigneeLabel'
import { DESCRIPTION_MAX, NAME_MAX, TASK_FIELD_ORDER, validateTask, type TaskErrors, type TaskField } from './validation'
import s from './TaskFormModal.module.css'

const FORM_ID = 'task-form'
const PRIORITY_OPTIONS: SelectOption[] = (['High', 'Medium', 'Low'] as const).map((p) => ({ value: p, label: p }))
const STATUS_OPTIONS: SelectOption[] = TASK_STATUSES.map((status) => ({ value: status, label: status }))

const focusField = (field: TaskField) => document.getElementById(`task-${field}`)?.focus()

interface TaskFormModalProps {
  open: boolean
  /** Omit to create a new task; pass a task to edit it. */
  task?: Task
  onClose: () => void
}

/** Form state lives in the dialog, so it resets (or re-fills from `task`) every time the modal opens. */
function TaskFormDialog({ task, onClose }: Omit<TaskFormModalProps, 'open'>) {
  const { addTask, updateTask } = useTasks()
  const toast = useToast()
  const labelOf = useAssigneeLabel()
  const assigneeOptions: SelectOption[] = [{ value: '', label: 'Unassigned' }, ...TEAM.map((name) => ({ value: name, label: labelOf(name) }))]
  const [values, setValues] = useState<TaskInput>(() =>
    task
      ? { name: task.name, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate, assignee: task.assignee }
      : { name: '', description: '', priority: 'Medium', status: 'To Do', dueDate: dateKeyOffset(1), assignee: ME },
  )
  const [errors, setErrors] = useState<TaskErrors>({})

  const setField = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateTask(values)
    const firstInvalid = TASK_FIELD_ORDER.find((field) => found[field])
    if (firstInvalid) {
      setErrors(found)
      focusField(firstInvalid)
      return
    }
    const input: TaskInput = { ...values, name: values.name.trim(), description: values.description.trim() }
    if (task) {
      updateTask(task.id, input)
      toast.success('Task updated.')
    } else {
      addTask(input)
      toast.success('Task added successfully.')
    }
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={task ? 'Edit task' : 'Add task'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={FORM_ID}>
            {task ? 'Save changes' : 'Add task'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} className={s.form} noValidate onSubmit={onSubmit}>
        <Input id="task-name" label="Task name" required maxLength={NAME_MAX + 20} autoComplete="off" value={values.name} error={errors.name} onChange={(e) => setField('name', e.target.value)} />
        <Textarea
          id="task-description"
          label="Description (optional)"
          maxLength={DESCRIPTION_MAX + 50}
          hint={`${values.description.length} / ${DESCRIPTION_MAX} characters`}
          value={values.description}
          error={errors.description}
          onChange={(e) => setField('description', e.target.value)}
        />
        <div className={s.row}>
          <Select label="Priority" options={PRIORITY_OPTIONS} value={values.priority} onChange={(e) => setField('priority', e.target.value as TaskPriority)} />
          <Select label="Status" options={STATUS_OPTIONS} value={values.status} onChange={(e) => setField('status', e.target.value as TaskStatus)} />
        </div>
        <div className={s.row}>
          <Input id="task-dueDate" label="Due date" type="date" required value={values.dueDate} error={errors.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
          <Select label="Assignee" options={assigneeOptions} value={values.assignee} onChange={(e) => setField('assignee', e.target.value)} />
        </div>
      </form>
    </Modal>
  )
}

export function TaskFormModal({ open, ...rest }: TaskFormModalProps) {
  return open ? <TaskFormDialog {...rest} /> : null
}

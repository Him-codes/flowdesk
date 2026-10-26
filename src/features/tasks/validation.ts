import type { TaskInput } from '../../types'
import { isValidDateKey } from '../../utils/dates'

export type TaskField = 'name' | 'description' | 'dueDate'
export type TaskErrors = Partial<Record<TaskField, string>>

export const TASK_FIELD_ORDER: TaskField[] = ['name', 'description', 'dueDate']
export const NAME_MAX = 80
export const DESCRIPTION_MAX = 300

export function validateTask(values: TaskInput): TaskErrors {
  const errors: TaskErrors = {}
  const name = values.name.trim()
  if (!name) errors.name = 'Enter a task name.'
  else if (name.length < 2) errors.name = 'Task name must be at least 2 characters.'
  else if (name.length > NAME_MAX) errors.name = `Task name must be ${NAME_MAX} characters or fewer.`

  if (values.description.trim().length > DESCRIPTION_MAX) errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`

  if (!values.dueDate) errors.dueDate = 'Choose a due date.'
  else if (!isValidDateKey(values.dueDate)) errors.dueDate = 'Enter a valid date.'
  return errors
}

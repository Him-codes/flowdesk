import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../components/layout'
import { Button, ConfirmDialog } from '../components/ui'
import { useTasks } from '../context/TasksContext'
import { useToast } from '../context/ToastContext'
import { TaskFormModal } from '../features/tasks/TaskFormModal'
import { TaskList } from '../features/tasks/TaskList'
import type { Task, TaskStatus } from '../types'

/** `undefined` = add a new task; a task = edit it; `null` = dialog closed. */
type FormState = Task | undefined | null

export default function TasksPage() {
  const { tasks, setTaskStatus, deleteTask } = useTasks()
  const toast = useToast()
  const [form, setForm] = useState<FormState>(null)
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null)

  const changeStatus = (task: Task, status: TaskStatus) => {
    setTaskStatus(task.id, status)
    toast.success(status === 'Completed' ? 'Task marked as completed.' : `Task moved to ${status}.`)
  }

  const toggleComplete = (task: Task) => {
    if (task.status === 'Completed') {
      setTaskStatus(task.id, 'To Do')
      toast.success('Task reopened.')
    } else changeStatus(task, 'Completed')
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    deleteTask(pendingDelete.id)
    setPendingDelete(null)
    toast.success('Task deleted.')
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Organize work and keep your team on track."
        actions={
          <Button icon={<Plus size={16} />} onClick={() => setForm(undefined)}>
            Add task
          </Button>
        }
      />
      <TaskList tasks={tasks} onAdd={() => setForm(undefined)} onToggle={toggleComplete} onEdit={setForm} onDelete={setPendingDelete} onSetStatus={changeStatus} />
      <TaskFormModal open={form !== null} task={form ?? undefined} onClose={() => setForm(null)} />
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this task?"
        description={pendingDelete ? `“${pendingDelete.name}” will be permanently deleted. This can’t be undone.` : ''}
        confirmLabel="Delete task"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  )
}

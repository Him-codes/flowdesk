import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { createTask, loadStoredTasks, tasksReducer } from '../data/tasks'
import type { Task, TaskInput, TaskStatus } from '../types'
import { STORAGE_KEYS, subscribeToStorage, writeStored } from '../utils/storage'

interface TasksContextValue {
  tasks: Task[]
  addTask: (input: TaskInput) => Task
  updateTask: (id: string, input: TaskInput) => void
  setTaskStatus: (id: string, status: TaskStatus) => void
  deleteTask: (id: string) => void
}

const TasksContext = createContext<TasksContextValue | null>(null)

/**
 * The single source of truth for tasks. Every change is saved to localStorage immediately, survives a refresh, and is
 * picked up by other open tabs. The dashboard activity feed and the Notifications feed are derived from this list.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadStoredTasks)

  useEffect(() => {
    writeStored(STORAGE_KEYS.tasks, tasks)
  }, [tasks])

  // Another tab changed the saved tasks: adopt them. Writing them back is a no-op, so there is no ping-pong.
  useEffect(() => subscribeToStorage(STORAGE_KEYS.tasks, () => dispatch({ type: 'replace', tasks: loadStoredTasks() })), [])

  const value = useMemo<TasksContextValue>(
    () => ({
      tasks,
      addTask: (input) => {
        const task = createTask(input)
        dispatch({ type: 'add', task })
        return task
      },
      updateTask: (id, input) => dispatch({ type: 'update', id, input }),
      setTaskStatus: (id, status) => dispatch({ type: 'setStatus', id, status }),
      deleteTask: (id) => dispatch({ type: 'delete', id }),
    }),
    [tasks],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used within TasksProvider')
  return ctx
}

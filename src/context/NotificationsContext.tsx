import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { api } from '../data/api'
import { buildTaskNotifications } from '../data/notifications'
import { filterNotifications } from '../data/preferences'
import { useAsync } from '../hooks/useAsync'
import { useDataRevision } from '../hooks/useDataRevision'
import { usePersistentState } from '../hooks/usePersistentState'
import type { AppNotification } from '../types'
import { STORAGE_KEYS, type Parse } from '../utils/storage'
import { usePreferences } from './PreferencesContext'
import { useTasks } from './TasksContext'

interface NotificationsContextValue {
  /** `undefined` until the first load completes. */
  notifications: AppNotification[] | undefined
  loading: boolean
  error: Error | null
  reload: () => void
  unreadCount: number
  isRead: (notification: AppNotification) => boolean
  markRead: (id: string) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

/** Read IDs for notifications that no longer exist are harmless, but the list is capped so it can't grow forever. */
const MAX_READ_IDS = 300
const cap = (ids: string[]) => (ids.length > MAX_READ_IDS ? ids.slice(-MAX_READ_IDS) : ids)

const parseReadIds: Parse<string[]> = (value) =>
  Array.isArray(value) ? cap(Array.from(new Set(value.filter((v): v is string => typeof v === 'string')))) : undefined

/**
 * One feed for the whole app, so the sidebar badge, the top-bar bell and the Notifications page can never disagree.
 *   server feed (simulated API: payments, customers, system)  +  task notifications (derived locally from live tasks)
 *   → filtered by the user's notification preferences → minus what the user has read (saved in the browser).
 * The server feed refetches when server data changes (a customer is added); task notifications update instantly.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const revision = useDataRevision()
  const { data: feed, loading, error, reload } = useAsync((signal) => api.getNotifications({ signal }), [revision])
  const { tasks } = useTasks()
  const { notifications: prefs } = usePreferences()
  const [readIds, setReadIds] = usePersistentState<string[]>(STORAGE_KEYS.notificationsRead, [], parseReadIds)

  const data = useMemo(
    () => (feed ? filterNotifications([...feed, ...buildTaskNotifications(tasks)], prefs) : undefined),
    [feed, tasks, prefs],
  )
  const readSet = useMemo(() => new Set(readIds), [readIds])

  const isRead = useCallback((n: AppNotification) => n.read || readSet.has(n.id), [readSet])
  const markRead = useCallback((id: string) => setReadIds((ids) => (ids.includes(id) ? ids : cap([...ids, id]))), [setReadIds])
  const markAllRead = useCallback(
    () => setReadIds((ids) => cap(Array.from(new Set([...ids, ...(data ?? []).map((n) => n.id)])))),
    [setReadIds, data],
  )

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications: data,
      loading,
      error,
      reload,
      unreadCount: (data ?? []).filter((n) => !isRead(n)).length,
      isRead,
      markRead,
      markAllRead,
    }),
    [data, loading, error, reload, isRead, markRead, markAllRead],
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

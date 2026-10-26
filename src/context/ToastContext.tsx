import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastViewport, type ToastItem, type ToastTone } from '../components/ui/Toast'

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)
const DURATION_MS = 4500
const MAX_VISIBLE = 3

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(0)

  const dismiss = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      const id = ++nextId.current
      setItems((list) => [...list.slice(-(MAX_VISIBLE - 1)), { id, tone, message }])
      window.setTimeout(() => dismiss(id), DURATION_MS)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

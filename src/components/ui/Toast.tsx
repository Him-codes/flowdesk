import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cx } from '../../utils/cx'
import { IconButton } from './IconButton'
import s from './Toast.module.css'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

const ICONS = { success: CheckCircle2, error: XCircle, info: Info }

interface ToastViewportProps {
  items: ToastItem[]
  onDismiss: (id: number) => void
}

/** Polite live region; mounted once by ToastProvider so screen readers announce new toasts. */
export function ToastViewport({ items, onDismiss }: ToastViewportProps) {
  return (
    <div className={s.viewport} role="region" aria-label="Status messages" aria-live="polite">
      {items.map((toast) => {
        const Icon = ICONS[toast.tone]
        return (
          <div key={toast.id} className={cx(s.toast, s[toast.tone])} role={toast.tone === 'error' ? 'alert' : 'status'}>
            <Icon size={18} className={s.icon} aria-hidden="true" />
            <p className={s.msg}>{toast.message}</p>
            <IconButton label="Dismiss message" size="sm" onClick={() => onDismiss(toast.id)}>
              <X size={16} />
            </IconButton>
          </div>
        )
      })}
    </div>
  )
}

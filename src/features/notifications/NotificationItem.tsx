import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, CircleDollarSign, Info, UserPlus, type LucideIcon } from 'lucide-react'
import { Button } from '../../components/ui'
import type { AppNotification, NotificationType } from '../../types'
import { cx } from '../../utils/cx'
import { useToast } from '../../context/ToastContext'
import { formatRelative } from '../../utils/format'
import s from './NotificationItem.module.css'

const ICONS: Record<NotificationType, LucideIcon> = { payment: CircleDollarSign, customer: UserPlus, task: CheckSquare, system: Info }
const LABELS: Record<NotificationType, string> = { payment: 'Payment', customer: 'Customer', task: 'Task', system: 'System' }

interface NotificationItemProps {
  notification: AppNotification
  read: boolean
  onMarkRead: (id: string) => void
}

/** Unread items are marked by a tinted background, accent edge and bold title, plus a screen-reader "Unread" prefix. */
export function NotificationItem({ notification: n, read, onMarkRead }: NotificationItemProps) {
  const ref = useRef<HTMLLIElement>(null)
  const toast = useToast()
  const Icon = ICONS[n.type]
  const tone = n.tone === 'error' ? s.error : n.tone === 'warning' ? s.warning : s[n.type]

  const markRead = () => {
    onMarkRead(n.id)
    toast.success(`Marked as read: ${n.title}`)
    // The button disappears once read, so keep keyboard focus on the item instead of losing it.
    ref.current?.focus()
  }

  return (
    <li ref={ref} tabIndex={-1} className={cx(s.item, !read && s.unread)}>
      <span className={cx(s.icon, tone)} aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className={s.body}>
        <p className={s.title}>
          {!read && <span className="sr-only">Unread: </span>}
          {n.title}
        </p>
        <p className={s.message}>{n.message}</p>
        <p className={s.meta}>
          <span>{LABELS[n.type]}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={n.timestamp}>{formatRelative(n.timestamp)}</time>
          {n.href && (
            <>
              <span aria-hidden="true">·</span>
              <Link to={n.href} className={s.link} aria-label={`${n.linkLabel ?? 'View'}: ${n.title}`} onClick={() => onMarkRead(n.id)}>
                {n.linkLabel ?? 'View'}
              </Link>
            </>
          )}
        </p>
      </div>
      {!read && (
        <div className={s.actions}>
          <Button variant="ghost" size="sm" aria-label={`Mark “${n.title}” as read`} onClick={markRead}>
            Mark as read
          </Button>
        </div>
      )}
    </li>
  )
}

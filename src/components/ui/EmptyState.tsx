import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import s from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  tone?: 'default' | 'error'
  role?: 'alert'
}

export function EmptyState({ icon, title, description, action, tone = 'default', role }: EmptyStateProps) {
  return (
    <div className={cx(s.empty, tone === 'error' && s.error)} role={role}>
      {icon && (
        <div className={s.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={s.title}>{title}</h3>
      {description && <p className={s.desc}>{description}</p>}
      {action && <div className={s.action}>{action}</div>}
    </div>
  )
}

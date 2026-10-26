import type { ReactNode } from 'react'
import s from './PageHeader.module.css'

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className={s.header}>
      <div>
        <h1 className={s.title}>{title}</h1>
        <p className={s.sub}>{subtitle}</p>
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  )
}

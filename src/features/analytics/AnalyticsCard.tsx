import type { ReactNode } from 'react'
import { Card } from '../../components/ui'
import { cx } from '../../utils/cx'
import s from './AnalyticsCard.module.css'

interface AnalyticsCardProps {
  id: string
  title: string
  /** Big number + change indicator shown top right (use `<HeadlineValue>`). */
  headline?: ReactNode
  /** Dims the content while a new date range loads. */
  stale?: boolean
  children: ReactNode
}

export function AnalyticsCard({ id, title, headline, stale = false, children }: AnalyticsCardProps) {
  return (
    <Card as="section" aria-labelledby={id} aria-busy={stale || undefined}>
      <div className={s.header}>
        <h2 id={id} className={s.title}>
          {title}
        </h2>
        {headline && <div className={cx(s.headline, stale && s.stale)}>{headline}</div>}
      </div>
      <div className={cx(stale && s.stale)}>{children}</div>
    </Card>
  )
}

export function HeadlineValue({ children }: { children: ReactNode }) {
  return <p className={s.value}>{children}</p>
}

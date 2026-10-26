import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import s from './Badge.module.css'

export type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'accent' | 'neutral'

export function Badge({ tone = 'neutral', dot = true, children }: { tone?: BadgeTone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={cx(s.badge, s[tone])}>
      {dot && <span className={s.dot} aria-hidden="true" />}
      {children}
    </span>
  )
}

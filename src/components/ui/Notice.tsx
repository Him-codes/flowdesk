import type { ReactNode } from 'react'
import { Info } from 'lucide-react'
import { cx } from '../../utils/cx'
import s from './Notice.module.css'

/** Inline callout for context the user should not miss (for example "demo only"). */
export function Notice({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  return (
    <div className={cx(s.notice, tone === 'warning' && s.warning)} role="note">
      <Info size={16} className={s.icon} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}

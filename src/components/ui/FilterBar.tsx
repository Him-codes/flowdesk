import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import s from './FilterBar.module.css'

/** Toolbar row for search, filters, sort and actions. Wraps on narrow screens. */
export function FilterBar({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={s.bar} role="group" aria-label={label}>
      {children}
    </div>
  )
}

/** `grow` gives a field (usually search) extra width; `fixed` keeps a control at its natural size (e.g. a button). */
export function FilterField({ children, grow, fixed }: { children: ReactNode; grow?: boolean; fixed?: boolean }) {
  return <div className={cx(s.item, grow && s.grow, fixed && s.fixed)}>{children}</div>
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../utils/cx'
import s from './Button.module.css'

interface BaseProps {
  /** Accessible name; icon-only controls must always have one. */
  label: string
  size?: 'sm' | 'md'
  children: ReactNode
}

type IconButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'>

export function IconButton({ label, size = 'md', children, className, ...rest }: IconButtonProps) {
  return (
    <button type="button" aria-label={label} className={cx(s.icon, size === 'sm' && s.iconSm, className)} {...rest}>
      <span className={s.glyph} aria-hidden="true">
        {children}
      </span>
    </button>
  )
}

/** `badge` shows a small count bubble (hidden from assistive tech: put the count in `label`). */
export function IconLink({ label, to, size = 'md', badge, children }: BaseProps & { to: string; badge?: number }) {
  return (
    <Link to={to} aria-label={label} className={cx(s.icon, size === 'sm' && s.iconSm)}>
      <span className={s.glyph} aria-hidden="true">
        {children}
      </span>
      {badge ? (
        <span className={s.badge} aria-hidden="true">
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </Link>
  )
}

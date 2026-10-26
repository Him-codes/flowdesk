import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cx } from '../../utils/cx'
import s from './Button.module.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  loading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, icon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(s.btn, s[variant], s[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Loader2 size={16} className={s.spin} aria-hidden="true" />
      ) : (
        icon && (
          <span className={s.glyph} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  )
})

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cx } from '../../utils/cx'
import s from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hideLabel?: boolean
  error?: string
  hint?: string
  icon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hideLabel, error, hint, icon, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const msgId = `${inputId}-msg`
  const message = error ?? hint

  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={inputId} className={cx(s.label, hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className={s.control}>
        {icon && (
          <span className={s.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cx(s.input, !!icon && s.hasIcon, !!error && s.invalid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          {...rest}
        />
      </div>
      {message && (
        <p id={msgId} className={cx(s.msg, !!error && s.err)}>
          {message}
        </p>
      )}
    </div>
  )
})

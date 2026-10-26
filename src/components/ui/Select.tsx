import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cx } from '../../utils/cx'
import s from './Select.module.css'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label: string
  options: SelectOption[]
  hideLabel?: boolean
  error?: string
  hint?: string
}

/** Styled native <select>: keyboard, screen-reader and mobile-picker behaviour come for free. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, hideLabel, error, hint, className, id, ...rest },
  ref,
) {
  const autoId = useId()
  const selectId = id ?? autoId
  const msgId = `${selectId}-msg`
  const message = error ?? hint

  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={selectId} className={cx(s.label, hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className={s.control}>
        <select
          ref={ref}
          id={selectId}
          className={cx(s.select, !!error && s.invalid)}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? msgId : undefined}
          {...rest}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={s.chevron} aria-hidden="true">
          <ChevronDown size={16} />
        </span>
      </div>
      {message && (
        <p id={msgId} className={cx(s.msg, !!error && s.err)}>
          {message}
        </p>
      )}
    </div>
  )
})

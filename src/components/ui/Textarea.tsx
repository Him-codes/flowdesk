import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cx } from '../../utils/cx'
import s from './Textarea.module.css'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, hint, className, id, ...rest }, ref) {
  const autoId = useId()
  const textareaId = id ?? autoId
  const msgId = `${textareaId}-msg`
  const message = error ?? hint

  return (
    <div className={cx(s.field, className)}>
      <label htmlFor={textareaId} className={s.label}>
        {label}
      </label>
      <textarea
        ref={ref}
        id={textareaId}
        className={cx(s.textarea, !!error && s.invalid)}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? msgId : undefined}
        {...rest}
      />
      {message && (
        <p id={msgId} className={cx(s.msg, !!error && s.err)}>
          {message}
        </p>
      )}
    </div>
  )
})

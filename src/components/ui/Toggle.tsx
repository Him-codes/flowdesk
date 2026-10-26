import { useId } from 'react'
import { cx } from '../../utils/cx'
import s from './Toggle.module.css'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  const labelId = useId()
  const descId = useId()

  return (
    <div className={s.row}>
      <div className={s.text}>
        <span id={labelId} className={s.label}>
          {label}
        </span>
        {description && (
          <span id={descId} className={s.desc}>
            {description}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={description ? descId : undefined}
        className={cx(s.track, checked && s.on)}
        onClick={() => onChange(!checked)}
      >
        <span className={s.thumb} aria-hidden="true" />
      </button>
    </div>
  )
}

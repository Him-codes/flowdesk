import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cx } from '../../utils/cx'
import { formatPercent } from '../../utils/format'
import s from './ChangeIndicator.module.css'

/** Percentage change with direction conveyed by icon and text, not colour alone. */
export function ChangeIndicator({ value, comparison }: { value: number; comparison: string }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={s.wrap}>
      <span className={cx(s.change, up ? s.up : s.down)}>
        <Icon size={14} aria-hidden="true" />
        {formatPercent(Math.abs(value))}
        <span className="sr-only">{up ? ' increase' : ' decrease'}</span>
      </span>
      <span className={s.compare}>{comparison}</span>
    </span>
  )
}

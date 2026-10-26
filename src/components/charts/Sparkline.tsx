import { cx } from '../../utils/cx'
import s from './Sparkline.module.css'

/** Decorative trend line. The card's text carries the real information, so this is hidden from assistive tech. */
export function Sparkline({ values, tone }: { values: number[]; tone: 'up' | 'down' }) {
  if (values.length < 2) return null
  const W = 100
  const H = 32
  const min = Math.min(...values)
  const span = Math.max(...values) - min || 1
  const d = values
    .map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * W).toFixed(2)} ${(H - 2 - ((v - min) / span) * (H - 4)).toFixed(2)}`)
    .join(' ')

  return (
    <svg className={cx(s.spark, s[tone])} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

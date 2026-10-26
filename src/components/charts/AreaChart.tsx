import { useId } from 'react'
import { useElementWidth } from '../../hooks/useElementWidth'
import { ChartDataTable, ChartTooltip } from './ChartParts'
import { evenIndexes, niceCeil, quarterTicks } from './scale'
import { useChartScrub } from './useChartScrub'
import c from './Chart.module.css'
import s from './AreaChart.module.css'

export interface ChartPoint {
  /** Short x-axis label. */
  label: string
  /** Full description used in the tooltip and the screen-reader table. */
  detail: string
  value: number
}

interface AreaChartProps {
  points: ChartPoint[]
  /** Optional comparison series (one value per point), drawn as a dashed line. */
  previous?: number[]
  previousLabel?: string
  /** Short name, e.g. "Revenue". */
  title: string
  /** One-sentence description of what the chart shows, read by screen readers. */
  summary: string
  formatValue: (value: number) => string
  formatAxis: (value: number) => string
  height?: number
}

const PAD = { top: 12, right: 12, bottom: 28, left: 52 }

/**
 * Responsive SVG area chart. Hover, touch-drag and arrow keys all reveal values; a visually hidden
 * data table and live region provide the same information to screen readers.
 */
export function AreaChart({ points, previous, previousLabel = 'Previous period', title, summary, formatValue, formatAxis, height = 280 }: AreaChartProps) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()
  const gradientId = `area-${useId().replace(/:/g, '')}`

  const h = width < 480 ? Math.min(height, 220) : height
  const innerW = Math.max(width - PAD.left - PAD.right, 0)
  const innerH = h - PAD.top - PAD.bottom
  const n = points.length
  const prev = previous && previous.length === n ? previous : null
  const max = niceCeil(Math.max(...points.map((p) => p.value), ...(prev ?? []), 1))

  const x = (i: number) => PAD.left + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH
  const baseline = PAD.top + innerH
  const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')

  const line = path(points.map((p) => p.value))
  const area = `${line} L${x(n - 1).toFixed(1)} ${baseline} L${x(0).toFixed(1)} ${baseline} Z`
  const labelIndexes = evenIndexes(n, width < 480 ? 3 : width < 768 ? 4 : 6)

  const { active, bind } = useChartScrub(n, (px) => (innerW <= 0 || n < 2 ? null : Math.round(((px - PAD.left) / innerW) * (n - 1))))
  const activePoint = active === null ? null : points[active]

  return (
    <figure className={c.figure}>
      <div
        ref={wrapRef}
        className={c.plot}
        style={{ height: h }}
        tabIndex={0}
        role="group"
        aria-label={`${title} chart. ${summary} Use the left and right arrow keys to inspect individual values.`}
        {...bind}
      >
        {width > 0 && (
          <svg width={width} height={h} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className={s.stopTop} />
                <stop offset="100%" className={s.stopBottom} />
              </linearGradient>
            </defs>
            {quarterTicks(max).map((tick) => (
              <g key={tick}>
                <line className={c.grid} x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
                <text className={c.axis} x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">
                  {formatAxis(tick)}
                </text>
              </g>
            ))}
            {labelIndexes.map((i, k) => (
              <text
                key={i}
                className={c.axis}
                x={x(i)}
                y={h - 8}
                textAnchor={k === 0 && n > 1 ? 'start' : k === labelIndexes.length - 1 && n > 1 ? 'end' : 'middle'}
              >
                {points[i].label}
              </text>
            ))}
            <path d={area} fill={`url(#${gradientId})`} />
            {prev && <path d={path(prev)} className={s.previous} />}
            <path d={line} className={s.line} />
            {active !== null && (
              <g>
                <line className={s.guide} x1={x(active)} x2={x(active)} y1={PAD.top} y2={baseline} />
                <circle className={s.dot} cx={x(active)} cy={y(points[active].value)} r={4.5} />
              </g>
            )}
          </svg>
        )}
        {activePoint && active !== null && (
          <ChartTooltip x={x(active)} width={width}>
            <div className={c.tipLabel}>{activePoint.detail}</div>
            <div className={c.tipValue}>{formatValue(activePoint.value)}</div>
            {prev && (
              <div className={c.tipLabel}>
                {previousLabel}: {formatValue(prev[active])}
              </div>
            )}
          </ChartTooltip>
        )}
        <div className="sr-only" aria-live="polite">
          {activePoint && active !== null ? `${activePoint.detail}: ${formatValue(activePoint.value)}${prev ? `. ${previousLabel}: ${formatValue(prev[active])}` : ''}` : ''}
        </div>
      </div>
      <ChartDataTable
        caption={`${title} data`}
        headers={prev ? ['Period', title, previousLabel] : ['Period', title]}
        rows={points.map((p, i) => ({ label: p.detail, cells: prev ? [formatValue(p.value), formatValue(prev[i])] : [formatValue(p.value)] }))}
      />
    </figure>
  )
}

import { useElementWidth } from '../../hooks/useElementWidth'
import { cx } from '../../utils/cx'
import type { ChartPoint } from './AreaChart'
import { ChartDataTable, ChartTooltip } from './ChartParts'
import { evenIndexes, integerTicks, niceCeil, quarterTicks } from './scale'
import { useChartScrub } from './useChartScrub'
import c from './Chart.module.css'
import s from './BarChart.module.css'

interface BarChartProps {
  points: ChartPoint[]
  title: string
  summary: string
  formatValue: (value: number) => string
  /** Whole-number axis ticks, for counts. */
  integer?: boolean
  height?: number
}

const PAD = { top: 12, right: 12, bottom: 28, left: 40 }

/** Responsive SVG bar chart with the same hover / touch / keyboard / screen-reader behaviour as AreaChart. */
export function BarChart({ points, title, summary, formatValue, integer = false, height = 260 }: BarChartProps) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>()

  const h = width < 480 ? Math.min(height, 220) : height
  const innerW = Math.max(width - PAD.left - PAD.right, 0)
  const innerH = h - PAD.top - PAD.bottom
  const n = points.length
  const peak = Math.max(...points.map((p) => p.value), 1)
  const ticks = integer ? integerTicks(peak) : quarterTicks(niceCeil(peak))
  const yMax = ticks[ticks.length - 1]

  const band = innerW / n
  const barWidth = Math.max(2, Math.min(band * 0.62, 32))
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH
  const center = (i: number) => PAD.left + band * (i + 0.5)
  const labelIndexes = evenIndexes(n, width < 480 ? 3 : width < 768 ? 4 : 6)

  const { active, bind } = useChartScrub(n, (px) => (band <= 0 ? null : Math.floor((px - PAD.left) / band)))
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
            {ticks.map((tick) => (
              <g key={tick}>
                <line className={c.grid} x1={PAD.left} x2={width - PAD.right} y1={y(tick)} y2={y(tick)} />
                <text className={c.axis} x={PAD.left - 8} y={y(tick) + 4} textAnchor="end">
                  {tick}
                </text>
              </g>
            ))}
            {labelIndexes.map((i) => (
              <text key={i} className={c.axis} x={center(i)} y={h - 8} textAnchor="middle">
                {points[i].label}
              </text>
            ))}
            {points.map((p, i) => (
              <rect
                key={p.detail}
                className={cx(s.bar, active !== null && active !== i && s.dim)}
                x={center(i) - barWidth / 2}
                y={y(p.value)}
                width={barWidth}
                height={Math.max(0, PAD.top + innerH - y(p.value))}
                rx={2}
              />
            ))}
          </svg>
        )}
        {activePoint && active !== null && (
          <ChartTooltip x={center(active)} width={width}>
            <div className={c.tipLabel}>{activePoint.detail}</div>
            <div className={c.tipValue}>{formatValue(activePoint.value)}</div>
          </ChartTooltip>
        )}
        <div className="sr-only" aria-live="polite">
          {activePoint ? `${activePoint.detail}: ${formatValue(activePoint.value)}` : ''}
        </div>
      </div>
      <ChartDataTable caption={`${title} data`} headers={['Period', title]} rows={points.map((p) => ({ label: p.detail, cells: [formatValue(p.value)] }))} />
    </figure>
  )
}

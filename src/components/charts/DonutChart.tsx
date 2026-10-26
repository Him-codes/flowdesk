import { useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useElementWidth } from '../../hooks/useElementWidth'
import { cx } from '../../utils/cx'
import { formatPercent } from '../../utils/format'
import { ChartTooltip } from './ChartParts'
import { arcPath, centroid, computeArcs } from './donutGeometry'
import c from './Chart.module.css'
import s from './DonutChart.module.css'

export interface DonutSegment {
  label: string
  value: number
  /** Any CSS colour, e.g. `var(--chart-1)`. */
  color: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  /** Short name, e.g. "Revenue by category". */
  title: string
  /** Sentence read by screen readers. Pair the chart with a visible table of the same values. */
  summary: string
  centerValue: string
  centerLabel: string
  /** Formats a segment's value in the tooltip (defaults to the raw number). */
  formatValue?: (value: number) => string
}

/** Tooltip anchor in pixels, relative to the donut. */
interface Active {
  index: number
  x: number
  y: number
}

/**
 * Donut chart. Hover, touch (tap a slice; tap elsewhere to dismiss) and the arrow keys show a tooltip with the
 * category, value and share. The visible table beside it remains the accessible data source.
 */
export function DonutChart({ segments, title, summary, centerValue, centerLabel, formatValue = String }: DonutChartProps) {
  const [wrapRef, size] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<Active | null>(null)
  useClickOutside(wrapRef, () => setActive(null), active !== null)

  const arcs = computeArcs(segments.map((seg) => seg.value))
  const drawn = arcs.filter((arc) => arc.visible)

  const anchorAt = (index: number): Active => {
    const [px, py] = centroid(arcs[index])
    return { index, x: (px / 200) * size, y: (py / 200) * size }
  }

  const followPointer = (index: number) => (e: ReactPointerEvent<SVGPathElement>) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (rect) setActive({ index, x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (drawn.length === 0) return
    const position = drawn.findIndex((arc) => arc.index === active?.index)
    const last = drawn.length - 1
    let next: number
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = position < 0 ? 0 : (position + 1) % drawn.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = position < 0 ? last : (position - 1 + drawn.length) % drawn.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else if (e.key === 'Escape') {
      setActive(null)
      e.preventDefault()
      return
    } else return
    e.preventDefault()
    setActive(anchorAt(drawn[next].index))
  }

  const current = active ? segments[active.index] : undefined
  const currentArc = active ? arcs[active.index] : undefined
  const shown = current && currentArc?.visible ? { segment: current, share: formatPercent(currentArc.share * 100, 1) } : null

  return (
    <div
      ref={wrapRef}
      className={s.wrap}
      tabIndex={0}
      role="group"
      aria-label={`${title}. ${summary} Use the arrow keys to inspect each category.`}
      onFocus={() => setActive((a) => a ?? (drawn[0] ? anchorAt(drawn[0].index) : null))}
      onBlur={() => setActive(null)}
      onKeyDown={onKeyDown}
    >
      <svg className={s.svg} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        {arcs.map((arc) =>
          arc.visible ? (
            <path
              key={segments[arc.index].label}
              d={arcPath(arc.start, arc.end)}
              fill={segments[arc.index].color}
              className={cx(s.segment, active !== null && active.index !== arc.index && s.dim)}
              onPointerEnter={followPointer(arc.index)}
              onPointerMove={followPointer(arc.index)}
              onPointerDown={followPointer(arc.index)}
              onPointerLeave={(e: ReactPointerEvent<SVGPathElement>) => {
                // A finger lifting also "leaves" the slice; keep the tooltip until the next tap elsewhere.
                if (e.pointerType !== 'touch') setActive(null)
              }}
            />
          ) : null,
        )}
      </svg>
      <div className={s.center}>
        <span className={s.centerValue}>{centerValue}</span>
        <span className={s.centerLabel}>{centerLabel}</span>
      </div>
      {active && shown && (
        <ChartTooltip x={active.x} y={active.y} width={size}>
          <div className={s.tipName}>
            <span className={s.tipSwatch} style={{ background: shown.segment.color }} aria-hidden="true" />
            {shown.segment.label}
          </div>
          <div className={c.tipValue}>{formatValue(shown.segment.value)}</div>
          <div className={c.tipLabel}>{shown.share} of total</div>
        </ChartTooltip>
      )}
      <div className="sr-only" aria-live="polite">
        {shown ? `${shown.segment.label}: ${formatValue(shown.segment.value)}, ${shown.share} of total` : ''}
      </div>
    </div>
  )
}

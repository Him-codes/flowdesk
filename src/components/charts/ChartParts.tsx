import type { ReactNode } from 'react'
import { cx } from '../../utils/cx'
import s from './Chart.module.css'

/**
 * Floating value readout. Flips to the left of the pointer on the right half of the chart.
 * Without `y` it sits at the top of the plot (line and bar charts); with `y` it is centred on that height.
 */
export function ChartTooltip({ x, y, width, children }: { x: number; y?: number; width: number; children: ReactNode }) {
  const horizontal = x > width * 0.55 ? { right: width - x + 12 } : { left: x + 12 }
  return (
    <div className={s.tooltip} aria-hidden="true" style={y === undefined ? horizontal : { ...horizontal, top: y, transform: 'translateY(-50%)' }}>
      {children}
    </div>
  )
}

interface ChartDataTableProps {
  caption: string
  headers: string[]
  rows: { label: string; cells: string[] }[]
}

/**
 * The chart's data as a visually hidden table, so screen-reader users get every value.
 *
 * The table sits inside a clipped 1×1px wrapper rather than being hidden directly: a table can never be
 * narrower or shorter than its content, so a hidden `<table class="sr-only">` still stretched the page's
 * scrollable area (sideways on phones, and downward by up to ~90 rows' height under the dashboard).
 * The wrapper contains that overflow while the table keeps its normal table semantics.
 */
export function ChartDataTable({ caption, headers, rows }: ChartDataTableProps) {
  return (
    <div className="sr-only">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Key for line styles (solid = this period, dashed = previous period). Text labels, so it never relies on colour alone. */
export function ChartLegend({ items }: { items: { label: string; dashed?: boolean }[] }) {
  return (
    <ul className={s.legend} aria-label="Chart key">
      {items.map((item) => (
        <li key={item.label} className={s.legendItem}>
          <span className={cx(s.swatch, item.dashed && s.swatchDashed)} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

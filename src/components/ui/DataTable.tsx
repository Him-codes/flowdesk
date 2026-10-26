import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import type { SortState } from '../../types'
import { cx } from '../../utils/cx'
import { Skeleton } from './Skeleton'
import s from './DataTable.module.css'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  align?: 'start' | 'end'
  /** Header becomes a sort button (requires `sort` + `onSortChange` on the table). */
  sortable?: boolean
  /** Direction applied the first time this column is sorted. Defaults to ascending. */
  defaultDirection?: SortState['direction']
  /** Hidden between 768px and 1279px, where horizontal space is tight. */
  hideOnTablet?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string
  /** Accessible table name (visually hidden). */
  caption: string
  loading?: boolean
  skeletonRows?: number
  sort?: SortState
  onSortChange?: (sort: SortState) => void
  /** Mouse/touch convenience only: every row must also expose a keyboard-accessible control that does the same thing. */
  onRowClick?: (row: T) => void
}

const SKELETON_WIDTHS = ['70%', '60%', '50%', '55%', '45%']

/**
 * Semantic table on wide screens; below 768px each row becomes a stacked card
 * (cells show their column header via `data-label`). Explicit ARIA roles keep table semantics in card mode.
 */
export function DataTable<T>({ columns, rows, getRowKey, caption, loading = false, skeletonRows = 5, sort, onSortChange, onRowClick }: DataTableProps<T>) {
  const cellClass = (column: Column<T>) => cx(s.td, column.align === 'end' && s.end, column.hideOnTablet && s.hideTablet)

  const toggleSort = (column: Column<T>) => {
    if (!onSortChange) return
    onSortChange(
      sort?.key === column.key
        ? { key: column.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: column.defaultDirection ?? 'asc' },
    )
  }

  const renderHeader = (column: Column<T>) => {
    const isSorted = sort?.key === column.key
    const ariaSort = column.sortable && onSortChange ? (isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none') : undefined
    const Icon = isSorted ? (sort.direction === 'asc' ? ArrowUp : ArrowDown) : ChevronsUpDown
    return (
      <th
        key={column.key}
        scope="col"
        role="columnheader"
        aria-sort={ariaSort}
        className={cx(s.th, column.align === 'end' && s.end, column.hideOnTablet && s.hideTablet, isSorted && s.sorted)}
      >
        {ariaSort ? (
          <button type="button" className={s.sortBtn} onClick={() => toggleSort(column)}>
            {column.header}
            <Icon size={14} className={s.sortIcon} aria-hidden="true" />
          </button>
        ) : (
          column.header
        )}
      </th>
    )
  }

  return (
    <div className={s.wrap} aria-busy={loading || undefined}>
      <table className={s.table} role="table">
        <caption className="sr-only">{caption}</caption>
        <thead className={s.head} role="rowgroup">
          <tr role="row">{columns.map(renderHeader)}</tr>
        </thead>
        <tbody className={s.body} role="rowgroup">
          {loading
            ? Array.from({ length: skeletonRows }, (_, r) => (
                <tr key={r} className={s.row} role="row">
                  {columns.map((column, c) => (
                    <td key={column.key} data-label={column.header} role="cell" className={cellClass(column)}>
                      <Skeleton height={16} width={SKELETON_WIDTHS[c % SKELETON_WIDTHS.length]} />
                    </td>
                  ))}
                </tr>
              ))
            : rows.map((row) => (
                <tr key={getRowKey(row)} className={cx(s.row, !!onRowClick && s.clickable)} role="row" onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.header} role="cell" className={cellClass(column)}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  )
}

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import s from './Pagination.module.css'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  /** Plural noun for the summary, e.g. "customers". */
  noun: string
}

export function Pagination({ page, pageSize, total, onPageChange, noun }: PaginationProps) {
  if (total === 0) return null
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <nav className={s.nav} aria-label={`${noun} pagination`}>
      <p className={s.summary}>
        Showing {from}–{to} of {total} {noun}
      </p>
      {pageCount > 1 && (
        <div className={s.controls}>
          <Button variant="secondary" size="sm" icon={<ChevronLeft size={16} />} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <span className={s.page} aria-current="page">
            Page {page} of {pageCount}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            Next
            <ChevronRight size={16} aria-hidden="true" />
          </Button>
        </div>
      )}
    </nav>
  )
}

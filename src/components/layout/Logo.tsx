import { Link } from 'react-router-dom'
import { cx } from '../../utils/cx'
import s from './Logo.module.css'

/** `collapse` hides the wordmark on very small screens (used in the top bar). */
export function Logo({ collapse = false }: { collapse?: boolean }) {
  return (
    <Link to="/dashboard" className={cx(s.logo, collapse && s.collapse)} aria-label="FlowDesk home">
      <img className={s.mark} src="/flowdesk-mark.svg" alt="" width="32" height="32" />
      <span className={s.word}>FlowDesk</span>
    </Link>
  )
}

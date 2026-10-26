import { Link } from 'react-router-dom'
import { CheckCircle2, CircleDollarSign, FileCheck2, UserPlus, type LucideIcon } from 'lucide-react'
import type { ActivityItem, ActivityType } from '../../types'
import { cx } from '../../utils/cx'
import { formatRelative } from '../../utils/format'
import s from './ActivityRow.module.css'

const ICONS: Record<ActivityType, LucideIcon> = { customer: UserPlus, payment: CircleDollarSign, invoice: FileCheck2, task: CheckCircle2 }

/** One entry in an activity list. Render inside a <ul>. */
export function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = ICONS[item.type]
  const tone = item.tone === 'error' ? s.failed : item.tone === 'warning' ? s.pending : s[item.type]
  return (
    <li className={s.item}>
      <span className={cx(s.icon, tone)} aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className={s.body}>
        <p className={s.name}>{item.title}</p>
        <p className={s.desc}>{item.description}</p>
        <p className={s.time}>
          <time dateTime={item.timestamp}>{formatRelative(item.timestamp)}</time>
          {item.href && (
            <>
              <span aria-hidden="true"> · </span>
              <Link to={item.href} className={s.link} aria-label={`${item.linkLabel ?? 'View'}: ${item.title}`}>
                {item.linkLabel ?? 'View'}
              </Link>
            </>
          )}
        </p>
      </div>
    </li>
  )
}

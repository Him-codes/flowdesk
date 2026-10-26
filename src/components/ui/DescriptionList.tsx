import type { ReactNode } from 'react'
import s from './DescriptionList.module.css'

export interface DescriptionItem {
  label: string
  value: ReactNode
}

export function DescriptionList({ items }: { items: DescriptionItem[] }) {
  return (
    <dl className={s.list}>
      {items.map((item) => (
        <div key={item.label} className={s.row}>
          <dt className={s.term}>{item.label}</dt>
          <dd className={s.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

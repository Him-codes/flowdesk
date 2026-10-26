import s from './StatGrid.module.css'

/** Row of small supporting figures under a chart. */
export function StatGrid({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className={s.grid}>
      {items.map((item) => (
        <div key={item.label} className={s.stat}>
          <dt className={s.label}>{item.label}</dt>
          <dd className={s.value}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
